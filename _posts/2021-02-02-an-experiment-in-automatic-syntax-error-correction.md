---
layout: post
title: An experiment in automatic syntax error correction
date: 2021-02-02 17:01 -0800
---
<style>
span.bold {font-weight: bold;}
span.red {color: red;}
span.green {color: green;}
span.blue {color: blue;}
</style>

Before program source code can be compiled or interpreted, it must be _parsed_. Traditionally, there are three main approaches to parsing. You can write a recursive descent parser by hand if you hate yourself, or use an LR parser generator if you hate your users, or use a PEG packrat parser generator if you hate yourself _and_ your users.

LR parser generators offer enormous benefits in correctness and maintainability over handwritten parsers, but nearly every popular programming language compiler uses a handwritten parser. The reason for this is that handwritten parsers are perceived as offering more useful error messages than LR parsers in the event that the user makes a mistake. Recently, I created _Ankou_, an experimental LR parser generator with the goal of offering _better_ syntax error messages than handwritten parsers using a novel search technique. In this post, I will describe the design of Ankou and its advantages and limitations.

## Background

An LR parser generator works by taking a description of the language to be parsed, in the form of a context free grammar (CFG) and generates a deterministic pushdown automata (DPDA) to recognize that language. The automata parses the input token by token and at each point, uses a lookup table to determine which state to transition to next, and whether to push or pop from the automata's stack, based on the input and current state and stack. (Sometimes generators will use mutually recursive functions or giant switch statements or the like instead of explicit tables, but the principle is the same either way). 

When the automata reaches an input token that has no entries in the lookup table, the parser will output an error message like "unexpected token at ...", which is often opaque and unhelpful to the user. Some parsers augment the error message by displaying the list of tokens that would have been accepted at that point, or other sorts of context, but the error messages are still often hard to understand and sometimes don't even point to the location in the source where the actual mistake was made.

### Prior work

This problem has long been recognized and there have been various proposals about how to improve error handling. For example, [Merr](https://www.cs.tufts.edu/~nr/cs257/archive/clinton-jefferey/lr-error-messages.pdf) allows the compiler writer to supply a list of example invalid programs along with the desired error message to be displayed for it. It associates each error message with the parser state where the corresponding program failed to parse, and then displays that error message to the user whenever the user supplies an invalid program that gets stuck in that same state.

Likewise, [Nimbleparse](https://arxiv.org/pdf/1804.07133.pdf) works by performing a search at the point of failure to find a sequence of token insertions and deletions that would repair the input and allow the parser to continue parsing, then displays these repair sequences to the user as suggested fixes to the source code.

### Hand written parsers

When comparing generated to hand written parsers, the obvious question is what the later actually do. Hand written parsers are attractive when it comes to error handling because you have full control over every aspect of the parser and can put in whatever error handling logic you can dream of. However, it still takes a lot of work and imagination to actually do so, which means that in the real world, even hand written parsers tend to have minimal error handling logic.

Real world error handling logic generally consists of code that recognizes a specific pattern and then displays a customized error message for that situation. This is usually used to recognize code constructs from other languages that are not part of the language being parsed which the user may nevertheless mistakenly try to employ or for patterns that typically indicate a specific and common mistake.

For example, the Rust parser will notice if you write `~expr` and tell you to write `!expr` instead for bitwise negation.

<pre>
<span class="bold red">error</span><span class="bold">: `~` cannot be used as a unary operator</span>
 <span class="bold blue">--> </span>temp.txt:3:11
  <span class="bold blue">|</span>
<span class="bold blue">3</span> <span class="bold blue">| </span>  let y = ~x;
  <span class="bold blue">| </span>          <span class="bold red">^</span> <span class="bold red">help: use `!` to perform bitwise not</span>

<span class="bold red">error</span><span class="bold">: aborting due to previous error</span>
</pre>

Likewise, the Go parser displays a special error message when you attempt to use an assignment as the condition of an if statement or for loop.

```go
func main() {
    x := true
    if x = true {
        fmt.Println("Hello, world!")
    }
}
```

```
./prog.go:9:7: syntax error: cannot use assignment (x) = (true) as value
```

There's no reason, however, that this technique should be limited to hand written parsers. It's easy to imagine an LR parser generator that provides the ability to annotate grammar productions with an error message that should be displayed when that rule is matched by the input. In fact, it should be much _easier_ to add such rules when using a parser generator, since it just requires adding a single line to the grammar file and the generator does all the heavy lifting for you.

However, I'm not interested in merely copying the few hand written error messages of existing parsers into a grammar file. With Ankou, my goal was to explore a different type of error handling that can _only_ be done using a parser generator - automatic generation of useful error messages for _any possible input_ via minimum cost repair sequences. 

### Minimum cost repair sequences

The problem of parser error generation is to a large extent underspecified - figuring out what the user _meant_ to do and the best way to explain their error to them is dependent on the user and the situation. In order to study it rigorously, one must turn it into a formally specified problem, and the most common formalism is the _minimum cost repair sequence_.

The minimum cost repair sequence is the minimal sequence of token insertions and deletions required to transform the input into valid syntax. Depending on the nature of the user's error, this may or may not result in finding the true mistake. For example, if the user is simply mistaken about what syntactic constructs the language allows, or they accidentally pasted in a giant block of text, minimal repair sequences will not help. However, they do work well in the case of typos and other small scale mistakes. Without a better way to define the problem, the minimal repair sequence is a decent general purpose heuristic.

> **Note:** The most common definition of repair sequences used in research also allows a third operation - changing one token to another. Since substitutions can be represented as a deletion followed by an insertion, this is equivalent to finding the minimum sequence of insertions and deletions where an insertion and deletion at the same position only costs 1 instead of 2. However, the precise definition does not matter much for the algorithms employed or their results, so I went with the simpler definition for Ankou.

It is possible to further extend this approach by developing a probabilistic model of the language and assigning weights to different kinds of insertions and deletions in different contexts based on how likely a user would be to make that mistake. However, doing this requires significant per-language manual work and a data set that does not generally exist. Furthermore, I expected that even simple unweighted repair sequences would still represent a huge improvement over existing parsers.

## Design

In the case of regular languages, minimum cost repair sequences are fast and easy to compute. You can just compute at each input position and for each state, the minimum cost to reach that state at that position, based on the previously computed costs at the previous input position. Since there are a constant number of parser states, this runs in linear time.

Unfortunately, this does not work with context free languages, because the state space of the parser is infinite. The standard algorithm for computing minimum cost repair sequences for arbitrary context free languages is [the CYK algorithm](https://en.wikipedia.org/wiki/CYK_algorithm), which requires `O(n^3)` time, making it infeasible for all but the smallest inputs. (Valiant's algorithm has a theoretically lower asymptotic complexity but is too slow to use in practice).

### Beam search

In order to scale to large files, we need to give up on calculating the optimal _minimum_ repair sequence and instead just try to approximate the problem and find a repair sequence that is good enough using _beam search_. Beam search works by choosing a fixed _beam width_ parameter `w`. Then we proceed as before, except that at every point, we only keep the `w` lowest cost states found so far. This results in an overall time complexity of `O(nw)` where `n` is the input size and `w` is a parameter that can be tuned to trade between performance and result quality. Since beam search runs in linear time, it scales to even the largest input files with ease.

### A* heuristics

With beam search, there is no guarantee that the states in the beam will be accept states upon reaching the end of the input. Therefore, we need to borrow a trick from [A* search](https://en.wikipedia.org/wiki/A*_search_algorithm) and add a heuristic value to the cost of each state. 

For each parser state searched, Ankou computes the minimum _completion_, the minimal sequence of tokens required to go from that state to the accept state. Completions are calculated using a combination of pre-computed lookup tables and dynamic programming. Then, if the length of the completion is longer than the number of tokens remaining in the input, the difference is added to the cost as the heuristic value. 

Lastly, if the optimal solution found at the end of the beam search is still not in the accept state, we can append insertions of each token in its completion to the end of the repair sequence to get the final repair sequence.

### Optimization

Ankou also has a number of preprocessing steps to optimize the language grammar and resulting parser automata. By eliminating redundant automata states ahead of time, the effective coverage level for any fixed beam width is increased. I plan to write about these optimizations in a later post, but they are not important to the examples presented here.

The examples here are all small and simple enough to not be constrained by beam width, so the evaluation of result quality here reflects how often minimum cost repair sequences are helpful for diagnosing real world syntax errors, while the optimizations merely improve Ankou's ability to actually find high quality repair sequences in the case of larger and more complex inputs.


## Evaluation

To start, let's try a simple Java program with an extra brace at the end of line 2, a type of error that Ankou should easily handle.

{% raw %}
```java
public class HelloWorld {
    public static void main(String[] args) {{
        System.out.println("Hello, world!");
    }
}
```
{% endraw %}

As it turns out, there are multiple minimum cost repair sequences for this program, so the output depends on the precise search order of the implementation. 

<pre>      }
  }
<span class="green">+ }
</span></pre>

Under Ankou's default search order, the result is a suggestion to insert a closing brace at the end of the file, which is another way to make the program valid syntax with a single token change, albeit not what the user intended.

<pre>  public class HelloWorld {
<span class="red">- </span>    public static void main(String[] args) <span class="red">{</span>{
<span class="green">+ </span>    public static void main(String[] args) {
          System.out.println("Hello, world!");
      }
</pre>

However, if the search order is reversed, Ankou will instead suggest deleting the extra opening brace, the actual cause of the error.

Even this simple example shows a major limitation of the approach - there are often multiple possible repair sequences. Ankou could easily be modified to return multiple suggested sets of changes in the event of a tie like Nimbleparse does, but this does not seem useful to me, especially because there could be an exponential number of possible changes. Personally, I think the best approach is to use language specific knowledge to weight potential changes and thus narrow the search down to the one change the user actually intended, but this is easier said than done.

However this example also demonstrates the strength of Ankou. Here, it is handling a syntax error that existing parsers fail miserably at. For example, here's what `javac` outputs on the same program:

```
HelloWorld.java:5: error: reached end of file while parsing
}
 ^
1 error
```

Not only does this error message not point to the actual location of the user's mistake, but it doesn't even give any indication of what is wrong or how the user could fix their program. This is typical of existing parsers, even hand written parsers such as javac's.

Let's widen the search and look at research projects rather than real world compilers. Here's what Nimbleparse outputs for this program:

```
Parsing error at line 5 column 2. Repair sequences found:
   1: Insert }
```

Nimbleparse at least presents *a* valid repair sequence to make the error go away, equivalent to the first output of Ankou shown above. However, this is not the actual mistake the user made (the extra opening brace on line 2). Ankou will sometimes show the actual mistake, depending on the search order being used, but Nimbleparse never will, because the mistake is _earlier_ in the program than the point where the parser will detect an error. 

This is a common occurrence with syntax errors involving braces, parenthesis and semicolons, and makes the resulting error messages legendarily opaque and frustrating to users. Unlike existing parsers, Ankou can automatically find and fix these errors because it looks at the entire source file, not just the bit right after where the parser first detected an invalid token.

As another example, let's see what happens when instead the opening brace on line 2 is _removed_.

{% raw %}
```java
public class HelloWorld {
    public static void main(String[] args)
        System.out.println("Hello, world!");
    }
}
```
{% endraw %}

In this case, Ankou still finds the problem easily.

<pre>  public class HelloWorld {
<span class="red">- </span>    public static void main(String[] args)
<span class="green">+ </span>    public static void main(String[] args)<span class="green">{
  </span>        System.out.println("Hello, world!");
      }
</pre>

And `javac`'s error messages are still utterly useless and misleading.

```
HelloWorld.java:2: error: ';' expected
    public static void main(String[] args)
                                          ^
HelloWorld.java:5: error: class, interface, or enum expected
}
^
2 errors
```

However, in this case, Nimbleparse is also able to find the correct repair, since it occurs at the point of the first invalid token, rather than before it.

```
Parsing error at line 3 column 9. Repair sequences found:
   1: Insert {

```

Finally, let's try something completely wild. Suppose the user did not understand how Java syntax worked and used parentheses everywhere in place of braces:

{% raw %}
```java
public class HelloWorld (
    public static void main(String[] args) (
        System.out.println("Hello, world!");
    )
)
```
{% endraw %}

Surprisingly, despite how badly mangled the input syntax is, Ankou does pretty well. It correctly fixes the first, third, and fourth brace substitutions.

<pre><span class="red">- </span>public class HelloWorld <span class="red">(
</span><span class="green">+ </span>public class HelloWorld <span class="green">{
</span><span class="red">- </span>    public static void main(String[] args) (
<span class="green">+ </span>    public static void main(String[] args)<span class="green">{</span> (
<span class="red">- </span>        System.out.println("Hello, world!");
<span class="green">+ </span>        System.out<span class="green">)</span>.println("Hello, world!");
<span class="red">-     )
- )
</span><span class="green">+ }}
</span></pre>

However, it misses the second brace substitution, instead suggesting inserting a parenthesis in a way that also fixes the input with the same number of token insertions and deletions, but not in the way the user intended. In this case, modifying Ankou to count a token substitution as a cost of 1 rather 2 would likely result in the correct set of changes.

Meanwhile, Nimbleparse gets the first substitution right but completely gives up after that.

```
Unable to repair input sufficiently to produce parse tree.

Parsing error at line 1 column 25. Repair sequences found:
   1: Insert {, Delete (
Parsing error at line 2 column 44. Repair sequences found:
   1: Insert {
Parsing error at line 3 column 44. No repair sequences found.
```

## Real world performance

In order to test the real world performance of Ankou, I collected a corpus of 21 real world examples of Java syntax errors by searching Stack Overflow for people asking for help with syntax errors. Unfortunately, the vast majority of the examples I found were due to people trying to run code at class or global scope, rather than inside a method as Java requires. Out of the first twelve samples, fully nine were of this type. After a while, I stopped bothering to even collect such examples.

Here are two examples of this type:

```java
import java.util.Scanner;
public class soma {
    int n1, n2, soma;
    Scanner sc1 = new Scanner(System.in);
    n1 = sc1.nextInt();
    Scanner sc2 = new Scanner(System.in);
    n2 = sc2.nextInt();
    soma = n1 + n2;
    System.out.println("A Soma de " + n1 + " e " + n2 + " é: " + soma);
}
```

<pre>  public class soma {
      int n1, n2, soma;
<span class="red">- </span>    Scanner sc1 = new Scanner(System.in);
<span class="green">+ </span>    Scanner sc1 = new Scanner(System.in);<span class="green">{
  </span>    n1 = sc1.nextInt();
      Scanner sc2 = new Scanner(System.in);
      System.out.println("A Soma de " + n1 + " e " + n2 + " é: " + soma);
  }
<span class="green">+ }
</span></pre>

In this case, Ankou suggests wrapping the code in an initializer block, which would actually do what the programmer intended, although they would probably want to use a static main method instead.

```java
package ifdemo;

public static void main(String args[}) {
    int a,b,c;{
    a=2;
    b=3;

    if (a<b) System.out.println("A is less than B");

    //this won't display anything if (a==b) System.out.println("You won't see this")
    System.out.println();
    c=a-b; // C contains -1
    System.out.println("C contains -1");
    if (C >= 0) system.out.println("C is non-negative");
    if (C < 0) system.out.println("C is negative");

    System.out.println();
    C=b-a; //C contains 1
    System.out.println("C contains 1");
    if (C >=0)System.out.println("C is non-negative");
    if (C<0)System.out.println("C is negative");

}}
```

<pre>  package ifdemo;
  
<span class="red">- </span>public static void main(String args[<span class="red">}</span>) {
<span class="green">+ </span>public static<span class="green"> class foo{</span> void main(String args[<span class="green">]</span>) {
      int a,b,c;{
      a=2;
  
  }}
<span class="green">+ }
</span></pre>

Here Ankou suggests inserting a class declaration to make the code valid. It also correctly fixed a bracket that had been typo'd as a brace.

And here are some examples of other types of syntax errors I found on Stack Overflow.

{% raw %}
```java
import java.util.*;

public class sum_to_n {
    public static void main(String [] args) {
        int n = 5;
        int result = sumOfNaturals(n);
        System.out.println("Sum is " result);
    }

    public static int sumOfNaturals(int input){
        int sum =0;
        for ( int i =0; i<=input; i++) {
            sum += i;
        }
        return sum;
    }
}
```
{% endraw %}

<pre>          int n = 5;
          int result = sumOfNaturals(n);
<span class="red">- </span>        System.out.println("Sum is " <span class="red">result</span>);
<span class="green">+ </span>        System.out.println("Sum is " );
      }
</pre>
Here the user likely intended to write `"Sum is " + result`, but Ankou suggests deleting `result` rather than inserting a `+`. This is an example where higher level knowledge would be required to deduce the intended fix.


{% raw %}
```java
public class Hw1a {
    public static void main(String args[]){
        String[] hpCharacters = ("Harry Potter", "Hermione Granger", "Ronald Weasley", "Voldemort");
        Novel harryPotter = new Novel ("Harry Potter", "JK Rowling", 303, hpCharacters);
        harryPotter.summary();
        System.out.println("\n" + harryPotter.isLong());

        String[] avenCharacters = ("Iron Man", "Captain America", "Black Widow", "The Hulk", "Thor");
        GraphicNovel avengers = new GraphicNovel ("Avengers", "Stan Lee", 50, avenCharacters, "Jack Kirby");
        avengers.listCharacters();
        avengers.summary();

        Article pc = new Article ("The Social Meaning of the Personal Computer", "Bryan Pfaffengerger", 10, "Anthropological Quaterly");
        System.out.println("\n" + pc.isLong());
        pc.summary();
    }
}
```
{% endraw %}

<pre>  public class Hw1a {
      public static void main(String args[]){
<span class="red">- </span>        String[] hpCharacters = ("Harry Potter", "Hermione Granger", "Ronald Weasley", "Voldemort");
<span class="green">+ </span>        String[] hpCharacters =<span class="green">foo</span> ("Harry Potter", "Hermione Granger", "Ronald Weasley", "Voldemort");
          Novel harryPotter = new Novel ("Harry Potter", "JK Rowling", 303, hpCharacters);
          harryPotter.summary();
          System.out.println("\n" + harryPotter.isLong());
  
<span class="red">- </span>        String[] avenCharacters = ("Iron Man", "Captain America", "Black Widow", "The Hulk", "Thor");
<span class="green">+ </span>        String[] avenCharacters =<span class="green">foo</span> ("Iron Man", "Captain America", "Black Widow", "The Hulk", "Thor");
          GraphicNovel avengers = new GraphicNovel ("Avengers", "Stan Lee", 50, avenCharacters, "Jack Kirby");
          avengers.listCharacters();
</pre>

Here the user appears to have mistakenly thought that array initializers use parentheses, rather than braces. Ankou suggests adding an identifier to the front to turn the whole thing into a function call, which is not what the user intended, but does require changing fewer tokens.



{% raw %}
```java
package practises;
import java.util.*;
public class T_5_2 {
    static Scanner in = new Scanner (System.in);
    public static void main (String [] args){
        float C;
        System.out.print("Enter temprature by centigrade : ");
        C=in.nextFloat();
        double F=ctof(C);
        System.out.print("temperature by far = " + F);
    }
    public static float ctof (float a){
        return (float) (1.8a+3);
    }
}
```
{% endraw %}

<pre>      }
      public static float ctof (float a){
<span class="red">- </span>        return (float) (1.8<span class="red">a</span>+3);
<span class="green">+ </span>        return (float) (1.8+3);
      }
  }
</pre>

Here, the user appears to have intended `1.8 * a + 3`, not realizing that you can't just multiply two values by sticking them next to each other like you can in mathematical notation. Ankou instead suggests deleting the `a` variable.


{% raw %}
```java
import java.io.*;
import java.util.Scanner;

public class PA8
{
    public static void main(String[] args)
    {
        boolean a = false;

        while(a == false)
        {
            try
            {
                Scanner keyboard = new Scanner(System.in);
                System.out.println("Please enter the name of an input text file");
                String text = keyboard.next();
                BufferedReader inputStream = null;

                inputStream = new BufferedReader (new FileReader(text + ".txt"));
                String inString = inputStream.readLine();

                while(inString != null)
                {
                    System.out.println(inString);
                    int x = Integer.valueOf(inString);
                    inString = inputStream.readLine();
                }
                inputStream.close();
            }
            catch(FileNotFoundException e)
            {
                System.out.println("Entry invalid please enter a valid text file name");
            }
            catch(IOException e)
            {
                System.out.println(e.getMessage());
            }
        }
        PrintWriter outputStream = null;

        try
        {
        outputStream = new PrintWriter
            (new FileOutputStream("numbers.dat"));
        }
        catch(FileNotFoundException e)
        {
            System.out.println("I/O problem: " + e.getMessage());
            System.exit(0);
        }

        while(a == false)
        {
            outputStream.writeInt(x);
        }
        for(IOException e)
        {
            System.out.println(e.getMessage());
        }

        outputStream.close();
    }
}
```
{% endraw %}

<pre>              outputStream.writeInt(x);
          }
<span class="red">- </span>        for(IOException e)
<span class="green">+ </span>        for(IOException e<span class="green">:true</span>)
          {
              System.out.println(e.getMessage());
</pre>

In this example, I can't even tell what the user was trying to do. Whatever it was, they appear to have been confused about how to properly arrange try and catch classes. Ankou suggests adding `: true` to make the `for` clause a valid iteration expression when the user probably meant for it to be a `catch` clause. Of course, you can't actually iterate over a boolean, but Ankou has no way to know that, since the language grammar just specifies a production like 

`FOR LPAREN type variable_declarator_id COLON assignment_expression RPAREN statement`.

Ruling out suggestions like this would require somehow intergrating the type checker with the parser.

## Conclusion

Approximate minimum cost repair sequences via global beam search offers a significant improvement in the quality of syntax error messages compared to existing approaches. However, it still has a number of limitations, and more research is required in order to increase the number of cases where it correctly deduces programmer intent.
