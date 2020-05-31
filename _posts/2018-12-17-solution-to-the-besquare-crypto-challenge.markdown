---
layout:	post
title:	"Solution to the besquare crypto challenge"
date:	2018-12-17
---

  In 2014, I wrote a bunch of cryptography challenges for a competition at my college, and also posted them online in case anyone else was interested in trying to solve them. Recently, someone contacted me asking for help with one challenge, named besquare. I realized that I never posted solutions for most of the problems, so I decided to write a post explaining how to solve this challenge. (If you want to try it yourself before reading the answer, you can find the code [here](https://github.com/nickbjohnson4224/greyhat-crypto-ctf-2014/blob/master/challenges/besquare/besquare.py))

The besquare challenge was unique in that rather than being written from scratch, it was inspired by a mishap during the 2013 CSAW qualifiers. CSAW (Computer Security Awareness Week) is an annual information security competition for college students held by NYU Poly. The competition includes various categories of hacking related challenges, including cryptography. As my team’s cryptography expert, I naturally tackled the crypto challenges, but there was one problem that I couldn’t solve no matter how hard I tried, due to a foolish misunderstanding of the problem. In the process, I came up with a potential attack for what I thought the problem was, so when it came time to write my own crypto challenges, I decided to take advantage of my mistake and use a modified version of the CSAW problem.

Before I get into my version of the problem, I will first explain the solution to the original problem from CSAW (written by Ben Agre). The basic idea is that there is a server which spies can log into using a special cryptographic protocol, and you have to find a weakness in the protocol. The code provided for the challenge is as follows:

```py
from hashlib import sha512,sha1
import random,sys,struct
import SocketServer
import base64 as b64
import os
import hmac
from time import time



class HandleCheckin(SocketServer.BaseRequestHandler):
    N = 59244860562241836037412967740090202129129493209028128777608075105340045576269119581606482976574497977007826166502644772626633024570441729436559376092540137133423133727302575949573761665758712151467911366235364142212961105408972344133228752133405884706571372774484384452551216417305613197930780130560424424943100169162129296770713102943256911159434397670875927197768487154862841806112741324720583453986631649607781487954360670817072076325212351448760497872482740542034951413536329940050886314722210271560696533722492893515961159297492975432439922689444585637489674895803176632819896331235057103813705143408943511591629
    accepted={}
    def hashToInt(self,*params):
        sha=sha512()
        for el in params:
            sha.update("%r"%el)
        return int(sha.hexdigest(), 16)
    def cryptrand(self,n=2048):
        p1=self.hashToInt(os.urandom(40))<<1600
        p1+=self.hashToInt(p1)<<1000
        p1+=self.hashToInt(p1)<<500
        p1+=self.hashToInt(p1)
        bitmask=((2<<(n+1))-1)
        p1=(p1&bitmask)
        return  (p1% self.N)
    def sendInt(self,toSend):
        s=hex(toSend)
        s=s[2:]
        if s[-1]=="L":
            s=s[:-1]
        self.request.sendall(s+"\n")
    def readInt(self):
        req=self.request
        leng = struct.unpack("H", req.recv(2))[0]
        if leng>520:
            req.sendall("Sorry that is too long a number\n")
            req.close()
            return None
        toRead = ""
        while len(toRead) < leng:
            toRead += req.recv(leng - len(toRead))
        if len(toRead) > leng:
            req.sendall("Ain't happenin today dave\n")
            req.close()
            return None
        return int(toRead,16)

    def checkBlacklist(self):
        foreign=self.request.getpeername()[0]
        if foreign in self.accepted:
            while(len(self.accepted[foreign]) >0 and
                self.accepted[foreign][0]<time()-600):
                del self.accepted[foreign][0]
            if len(self.accepted[foreign])>5:
                self.request.send("Too many requests too quick sorry\n")
                self.request.close()
                return False
        else:
            self.accepted[foreign]=[]
        return True

    def doChallenge(self):
        req=self.request

        proof = b64.b64encode(os.urandom(12))
        req.sendall("You must first solve a puzzle, a sha1 sum ending in 24 bit's set to 1, it must be of length %s bytes, starting with %s" % (len(proof)+5, proof))
        test = req.recv(21)

        ha = sha1()
        ha.update(test)

        if(not self.checkBlacklist()):
            return False
        if (test[0:16] != proof or
            ha.digest()[-3:] != "\xff\xff\xff"):
            req.sendall("NOPE")
            req.close()
            return False

        self.accepted[self.request.getpeername()[0]].append(time())

        return True

    def getClientParams(self):
        N=self.N
        req=self.request
        index=self.readInt()
        if index is None:
            return
        if index<2 or index>N/2:#we don't have nearly that many users, we wish we did but lets be honest ,brute force attempt
            req.sendall("A Wrong move against the motherland\n")
            req.close()
            return None
        req.sendall("Please provide your ephemeral key, can never be too careful\n")
        cEphemeral=self.readInt()
        if cEphemeral is None:
            return None
        if  cEphemeral%N==0:
            req.sendall("The Wrong move against the motherland\n")
            req.close()
            return None
        return cEphemeral,index

    def doSlurp(self,index,cEphemeral,salt):
        N=self.N

        password = ""
        hashToInt= self.hashToInt
        salt=hashToInt(index)

        storedKey = pow(index, hashToInt(salt, password), N)
        multiplierSlush = 3

        sEphemeralPriv = self.cryptrand()
        sEphemeral = (multiplierSlush * storedKey +
            pow(index, sEphemeralPriv, N)) % N

        self.sendInt(salt)
        self.sendInt(sEphemeral)

        slush = hashToInt(cEphemeral, sEphemeral)
        agreedKey = hashToInt(pow(cEphemeral * pow(storedKey, slush, N), sEphemeralPriv, N))
        return agreedKey,sEphemeral

    def handle(self):
        N=self.N
        hashToInt=self.hashToInt
        req = self.request
        if(not self.doChallenge()):
            return

        req.sendall("Welcome to Arstotzka's check in server, please provide the agent number\n")

        cEphemeral,index=self.getClientParams()

        salt=self.hashToInt(index)
        agreedKey,sEphemeral=self.doSlurp(index,cEphemeral,salt)

        gennedKey=hashToInt(hashToInt(N) ^ hashToInt(index), hashToInt(index), salt,
            cEphemeral, sEphemeral, agreedKey)

        check=self.readInt()

        if(check==gennedKey):
            req.sendall("Well done comrade, the key to the vault is {} \n")

        req.close()

class ThreadedServer(SocketServer.ThreadingMixIn, SocketServer.TCPServer):
    pass

if __name__ == "__main__":
    HOST, PORT = "", int(sys.argv[1])
    server = ThreadedServer((HOST, PORT), HandleCheckin)
    server.allow_reuse_address = True
    server.serve_forever()
```

This is an implementation of a custom password-authenticated key exchange (PAKE) protocol. The server and the client (spy) have a shared secret — the spy’s password. Using this shared secret, they can exchange messages to agree on a temporary secret key in a way that is not vulnerable to eavesdroppers.

The particular protocol in this challenge is presumably intended to function as follows. Note that only the code for the server is provided in the challenge. I inferred the client portion of the protocol here, though it doesn’t actually matter for the purposes of the challenge.

Setup:  
Client and server agree on a shared secret (the password) and a public shared prime modulus, N.

Client:  
Chooses an integer i and generate a secure random number a. Compute the client ephemeral key c = iᵃ mod N and then send i and c to the server.

Server:  
Verify that 1 < i < N/2 and c ≠ 0 mod N.  
Compute salt = hash(i)  
Compute salted password hash h = hash(salt, password)  
Generate a secure random number b  
Compute server ephemeral key s = 3iʰ + iᵇ mod N  
Send salt and s to the client.  
(Sending the salt is not actually necessary here, since it is based only on information available to the client. Presumably, it was designed this way so that the salt algorithm could be changed without needing to update the client.)

Client:  
Compute h = hash(salt, password)  
Compute j = s − 3iʰ mod N  
(This is just temporary value to split the computation up for clarity. Here, j is just iᵇ mod N. Note that the client does **not** know the value of b, only iᵇ)  
Compute temporary value e = a + h × hash(c, s)  
Compute agreed key k = jᵉ mod N  
Compute “genned key” g = hash(hash(N) ^ hash(i), hash(i), salt, c, s, a)  
(Note that every component of g is visible to an eavesdropper with the exception of a, so a and g are roughly equivalent in terms of security)  
Send g to the server  

Server:  
Compute temporary value m = b × h × hash(c, s)  
Compute agreed key k = cʳ + iᵐ mod N  
Compute “genned key” g = hash(hash(N) ^ hash(i), hash(i), salt, c, s, a)  
Verify that the computed value of g matches that received from the client  

For the purpose of the challenge, the goal is to successfully impersonate the client without knowing the password. We also do not have any recorded legitimate sessions available, so the only tool at our disposal is the ability to send different values of i and c to the server and see what values of s we get back.

First off, we can send c=1 to simplify the calculations. A legitimate client needs to choose c to be a random power of i in order to maximize security, but we are under no such constraints, and using c=1 means there is one less step we have to worry about at the end. So I will assume that c=1.

Next, the security of the system rests on us not being able to determine iᵇ from s without knowing the password. If we have a way to figure out the value of iᵇ, we can easily calculate the agreed key and hence break the system.

If we were able to set i = 1, then we would of course know iᵇ because it would always be 1. Unfortunately for us, the server requires that i ≥ 2. Likewise, if we were able to set i = N-1 (and hence i=-1 mod N), we would know that iᵇ is either 1 or -1 (mod N), and could just keep trying until we win the coin flip. Unfortunately, this possibility is also blocked by the check that i < N/2.

So our goal is to find a value of i such that 1 < i < N/2 and iᵇ mod N has only a small number of possible values. Luckily, we can do this with a bit of number theory.

The key is that N is a) prime and b) one more than a multiple of 4. As the actual value of N is 617 digits long, I’ll demonstrate with a smaller prime, 13, instead. For example, here are the powers of 2 mod 13.

1 2 4 8 3 6 12 11 9 5 10 7 1

We have 2 ** 12 = 1 mod 13, and hence the cycle repeats. 2 ** 14 = 2, 2 ** 15 = 4, etc. (I am using ** here for exponents.) You might wonder whether this is a coincidence, but in fact, raising any (nonzero) number to different powers modulo a prime will eventually yield 1. The smallest nonzero power k such that xᵏ = 1 mod p is known as the order of x (in the multiplicative group of integers modulo p). So ord(2) = 12. Since there are only p−1 possible nonzero numbers mod p, the highest possible order is p−1. A number x with ord(x) = p − 1 will generate every possible number mod p as a power of x and hence is known as a generator. So 2 is a generator in the group of integers mod 13.

In the previous example, all the powers of 2 were shown between 0 and 12. However, when working with modular arithmetic, the choice of range is arbitrary. Instead of using the range 0 to p-1, using the range -(p-1)/2, p-1/2 makes the patterns clearer. So for example, here are the same powers of 2 mod 13 as before, but now shown in the range -6 to 6.

1 2 4 -5 3 6 -1 -2 -4 5 -3 -6 1

You can see that the middle number is -1, which makes sense, since we know that 2 ** 12 = 1, and hence (2 ** 6)² = 1 mod 13. We know that -1 must appear as some power of 2, and this is the only place it can appear. Since 2 ** 6 = -1, this also means that the second half must be the same as the first half with the signs flipped, as 2 ** 7 = (2 ** 6) × (2 ** 1), 2 ** 8 = (2 ** 6) × (2 ** 2) etc.

This will be true regardless of the original number. For example, if we choose a different generator, 6, the same pattern emerges.

1 6 -3 -5 -4 2 -1 -6 3 5 4 -2 1

Now what happens if we choose a number that is not a generator? For example, take the powers of 4 mod 13.

1 4 3 -1 -4 -3 1 4 3 -1 -4 -3 1

As you can see, this repeats every 6 steps instead of every 12. You may also notice that this is just the same as the powers of 2, except with every other number skipped, which makes sense since 4 = 2², so the kth power of 4 is the 2k-th power of 2. This means that the powers of 4 repeat every 12/2 = 6 steps.

At this point, you may object — isn’t every number a power of 2? How can 6 be a generator then? The answer is that 6 = 2 ** 5, and 5 does not share any factors with 12, so if you take every 5th power of 2, you’ll skip past the end and wrap around instead of hitting it cleanly. The end result is that you get a full 12 powers of 6. But if you raise 2 to any multiple of 2 or 3, you will get a non-generator with order at most 12/2=6 or 12/3=4 respectively.

This also implies that the number of generators mod p is equal to the number of numbers mod *p−1* which are coprime to p−1 (i.e share no common factors with p−1). 12 has an unusually large amount of factors relative to its size, so there aren’t many generators mod 13, but most numbers don’t have so many factors, which means that generators are plentiful and easy to find by chance. For example, consider the numbers modulo the prime 311. p−1 = 310 has the factorization 2 × 5 × 31, which means that there are (2−1) × (5−1) × (31−1) = 120 generators. If you tried numbers randomly, you’d find a generator after only 2.6 tries on average.

At any rate, all this number theory lets us find a number modulo N with a very *low* order, and in particular, a “fourth root” of 1 modulo N. The crucial fact is that not only is N prime, but N = 1 mod 4. Let N = 1 + 4k. Then any generator g mod N will have ord(g) = N−1 = 4k. This implies that ord(gᵏ) = 4k/k = 4. So we just found a number gᵏ which is not 1, not -1, and has only 4 possible powers mod N. If the number gᵏ ends up > N/2, we can just use -gᵏ instead, which will also be a fourth root of 1.

For example, consider the process with N=13 and suppose we chose g=2. Then we have k=3 and gᵏ = 8 mod 13. 8 > 13/2, so it will be rejected by the 2 < i < N/2 check in the original server code. However, -8 = 5 mod 13 works just as well and is within the range. Sure enough, if we check the powers of 5 mod 13, there are only 4 possible values.

1 5 -1 -5 1

So now we have our method to crack the original problem — choose a number x arbitrarily, and calculate xᵏ mod N, where N = 4k + 1. If we get 1 or -1, try again. Then use that value as i and submit it to the server. We will get back s, and then guess a value for iᵇ. Since there are only 4 possible values, we will have a 25% success rate guessing randomly, and log in successfully after an average of four tries.

Overall, it’s a simple problem if you’ve studied number theory. So what went wrong? I saw that N used the variable name “N” instead of “P” and assumed that that meant that it must be composite, rather than prime. All the information I could find online and all the attacks I could think of involved the case of a prime modulus, but it still never occurred to me to simply check whether N was prime or not. Eventually, I came up with an offline dictionary attack which works even when N is composite, but since the CSAW problem was designed assuming a full break, it used a strong password, and hence, my dictionary attack failed. But when it came time to write my own crypto challenges, I decided not to let the attack I came up with go to waste, which brings us to the besquare challenge.

```py
from hashlib import sha512,sha1
import random,sys,struct
import SocketServer
import base64 as b64
import os
import hmac
from time import time

password = open('password.txt','rb').read()
flag = open('flag.txt','rb').read()
N = 0x3a8e96c21536f93f9fe819d151b2114577176a6f7c05d8c3f6593d5046a54deed90c756ab121a60623f5e27c202e6c4cbf72990797fda6ea988e0d42575d4a76d2936f3bcb92eab88098fa6d5ef93d30eede6c32c8c3f1f576fb72d24bec2df08282eb3587af0a9f984af5fa4d665038e98789561f59718635c5081dd8d2025c109f980630809bb61020d8185705f224b94a7f1760a0f2d6a93fb4f3caeb9fbc408b346b97b726dedcd87f72c12f72a5f552ee2e2260ee0295d7a1013ddd778a3ce6480832e85b4e8d5389404c0884c0fa78b197afef8a156dfadae80523eb9cd9911180fb193ebeeb141f2f3f4cd682b373c3832a43875f94646a8ef2d206eb

class HandleCheckin(SocketServer.BaseRequestHandler):
    accepted = {}
    def hashToInt(self,*params):
        sha = sha512()
        for el in params:
            sha.update("%r"%el)
        return int(sha.hexdigest(), 16)

    def cryptrand(self,n = 2048):
        p1 = self.hashToInt(os.urandom(40))<<1600
        p1+= self.hashToInt(p1)<<1000
        p1+= self.hashToInt(p1)<<500
        p1+= self.hashToInt(p1)
        bitmask = ((2<<(n+1))-1)
        p1 = (p1&bitmask)
        return (p1 % N)

    def sendInt(self,toSend):
        s = hex(toSend)
        s = s[2:]
        if s[-1] =="L":
            s = s[:-1]
        self.request.sendall(s+"\n")

    def readInt(self):
        req = self.request
        leng = struct.unpack("H", req.recv(2))[0]
        if leng>520:
            req.sendall("Sorry that is too long a number\n")
            req.close()
            return None
        toRead = ""
        while len(toRead) < leng:
            toRead +=  req.recv(leng - len(toRead))
        if len(toRead) > leng:
            req.sendall("Length does not match input data size\n")
            req.close()
            return None
        return int(toRead.strip('Ll'),16)

    def checkBlacklist(self):
        foreign = self.request.getpeername()[0]
        if foreign in self.accepted:
            while(len(self.accepted[foreign]) >0 and
                self.accepted[foreign][0]<time()-600):
                del self.accepted[foreign][0]
            if len(self.accepted[foreign])>35:
                self.request.send("Too many requests too quick sorry\n")
                self.request.close()
                return False
        else:
            self.accepted[foreign] = []
        return True

    def doChallenge(self):
        req = self.request

        proof = b64.b64encode(os.urandom(12))
        req.sendall("You must first solve a puzzle, a sha1 sum ending in 24 bit's set to 1, it must be of length %s bytes, starting with %s" % (len(proof)+5, proof))
        test = req.recv(21)

        ha = sha1()
        ha.update(test)

        if(not self.checkBlacklist()):
            return False
        if (test[0:16] !=  proof or
            ha.digest()[-3:] !=  "\xff\xff\xff"):
            req.sendall("NOPE")
            req.close()
            return False

        self.accepted[self.request.getpeername()[0]].append(time())
        return True

    def getClientParams(self):
        req = self.request
        index = self.readInt()
        if index is None:
            return
        if index<2 or index>N/2:#we don't have nearly that many users, we wish we did but lets be honest ,brute force attempt
            req.sendall("Invalid nonce\n")
            req.close()
            return None
        req.sendall("Please provide your ephemeral key\n")
        cEphemeral = self.readInt()
        if cEphemeral is None:
            return None
        if cEphemeral%N ==0:
            req.sendall("Invalid ephemeral key\n")
            req.close()
            return None
        return cEphemeral,index

    def authenticate(self,index,cEphemeral,salt):
        hashToInt =  self.hashToInt
        salt = hashToInt(index)

        storedKey = pow(index, hashToInt(salt, password), N)
        multiplierSlush = 3

        sEphemeralPriv = self.cryptrand()
        sEphemeral = (multiplierSlush * storedKey +
            pow(index, sEphemeralPriv, N)) % N

        self.sendInt(salt)
        self.sendInt(sEphemeral)

        slush = hashToInt(cEphemeral, sEphemeral)
        agreedKey = hashToInt(pow(cEphemeral * pow(storedKey, slush, N), sEphemeralPriv, N))
        return agreedKey,sEphemeral

    def handle(self):
        hashToInt = self.hashToInt
        req = self.request
        if (not self.doChallenge()):
            return

        req.sendall("""Welcome to the new cryptographic authentication server. Log in or be square!

Note: passwords must contain at least one uppercase, one lowercase, and one digit. Sorry for the inconvienence but we've had problems with weak passwords lately.

To begin, please provide a randomly generated nonce.
""")

        cEphemeral,index = self.getClientParams()

        salt = self.hashToInt(index)
        agreedKey,sEphemeral = self.authenticate(index,cEphemeral,salt)

        gennedKey = hashToInt(hashToInt(N) ^ hashToInt(index), hashToInt(index), salt,
            cEphemeral, sEphemeral, agreedKey)

        check = self.readInt()

        if (check == gennedKey):
            req.sendall(flag+"\n")

        req.close()

class ThreadedServer(SocketServer.ThreadingMixIn, SocketServer.TCPServer):
    pass

if __name__ ==  "__main__":
    HOST, PORT = sys.argv[1], int(sys.argv[2])
    print 'Running on port', PORT
    server = ThreadedServer((HOST, PORT), HandleCheckin)
    server.allow_reuse_address = True
    server.serve_forever()
```

The besquare code is functionally identical to the original CSAW challenge except for the value of N, which I obviously changed to be composite. The attack described in the previous section doesn’t work for the besquare challenge because there is no known way to efficiently find low order elements modulo a composite number (without knowing its factorization). Instead, we’ll have to try something different.

To provide a hint, I also changed the welcome message when you connect to the server. The new message says “Note: passwords must contain at least one uppercase, one lowercase, and one digit. Sorry for the inconvienence but we’ve had problems with weak passwords lately.” This was intended as a hint that the password for the besquare challenge (unlike the CSAW challenge) is weak, i.e. guessable.

However, trying to brute force the password will quickly run into the issue that the server uses proof of work and rate limiting (carried over unchanged from the CSAW challenge). This means that there is a limit of how quickly you can test guesses against the live server. The challenge is to find a way to test password guesses quickly without touching the server each time. This is known as an offline dictionary attack.

The only piece of information we can get back from the server is s = 3iʰ + iᵇ mod N, where h is the hash of the password and b is a secret random number. If we knew the value of b for a given s, we could easily test candidate passwords by hashing them and seeing whether iʰ matches up to the expected value. However, the whole point of the protocol is that b is a number which is known only to the server.

Although b is a perfectly random number, iᵇ is not completely random — we know it is some power of i, which is chosen by us. It is impossible to find a low order value to use for i as in the previous attack, so no matter what we do, iᵇ will have a very large number of possible values. But what if we had some way of distinguishing values that were some power of i from values that weren’t?

For example, suppose we had a function that could determine whether any given number was a square mod N. This isn’t as trivial as it sounds, since the modulus means you can’t just take the square root and see if it is an integer. For a given value x, you are trying to determine whether there exists some r and k such that r² = x + kN. If there is, x is a *quadratic residue* mod N, otherwise it is called a *quadratic nonresidue*.

Armed with a quadratic residue testing function, we could conduct an offline dictionary attack. We would just choose a square number for i. Since any power of a square is still a square, iᵇ is guaranteed to be a quadratic residue, regardless of the value of b. This means that we can test candidate passwords by computing s − 3iʰ and checking if it is a quadratic residue or not. If our guess is correct, it will always be a quadratic residue. If our guess is incorrect, s − 3iʰ will effectively be a random number, so it may or may not be a quadratic residue. Therefore, we can just collect a bunch of (i, s) pairs from the server, and test each candidate password by seeing if any of the remainders are quadratic nonresidues. The name of the problem (besquare) itself was even intended as a hint that square numbers are involved in the solution.

So are we done? Not quite. As it turns out, there is no known way to test quadratic residues modulo a composite (of unknown factorization). In fact, there are cryptosystems which rely on the hardness of this problem for their security. However, number theory once again comes our rescue with a slight workaround.

Since “function that checks for quadratic residues” is a bit of a mouthful, mathematicians introduced a function called [the Legendre symbol](https://en.wikipedia.org/wiki/Legendre_symbol) for this purpose. It is typically written vertically like a fraction, but since Medium forbids mathematical notation and the normal notation is confusing anyway, I will write it as Leg(x, n) instead. This function is defined by the rules

Leg(x, n) = 1 if x is a quadratic residue mod n  
Leg(x, n) = -1 if x is a quadratic nonresidue mod n  
Leg(x, n) = 0 if x shares a factor with n  

One obvious property is that the Legendre symbol is multiplicative — that is Leg(a × b, n) = Leg(a, n) × Leg(b, n) for any a and b. Furthermore, it is always 1 or -1 for numbers coprime to n. (We will ignore the case of numbers not coprime to n, because in the unlikely event that we ever stumble on one, it means we have found the factorization of N anyway and can thus solve the problem through the previous attack).

As mentioned above, the Legendre symbol can’t be computed for composite n without knowing the factorization of n. However, it is easy to compute for prime n. In fact, since we know that prime moduli always have a generator, we know that the quadratic residues modulo a prime are exactly the even powers of a generator, and the nonresidues are the odd powers of that generator. Furthermore, we know that a quadratic residue must always have order at most (p-1)/2 and hence x ** (p-1)/2 = 1 mod p for any residue x. Likewise, x ** (p-1)/2 = -1 mod p for any non residue x. So we can compute the Legendre symbol for prime moduli with a single modular exponent.

What about the composite case? Any modular equation must also hold modulo any factor of the modulus. For example, suppose n = pq where p and q are different prime factors. Then x is a quadratic residue mod n if there is some y such that y² = x mod n. However, if this is true, then it is also true that y² = x mod p and y² = x mod q, since any multiple of n is also a multiple of p and of q. Therefore, Leg(x, pq) = 1 if and only if Leg(x, p) = 1 and Leg(x, q) = 1. If we knew the factors of n, we could easily calculate this, but we don’t so we can’t.

Another mathematician, Jacobi, introduced [the Jacobi symbol](https://en.wikipedia.org/wiki/Jacobi_symbol) (here written Jac(a, n)), as a slight modification of the Legendre symbol. The Jacobi symbol is defined the same way as the Legendre symbol for prime moduli:

Jac(x, p) = 1 if x is a quadratic residue mod p  
Jac(x, p) = -1 if x is a quadratic nonresidue mod p  
Jac(x, p) = 0 if x is a multiple of p  

However, the Jacobi symbol differs in its treatment of composite moduli. For a composite n with factorization n = pq where p and q are primes, it is defined as Jac(x, pq) = Jac(x, p) × Jac(x, q). (It is defined for composite numbers with more factors in a similar manner.)

This is almost the same as the Legendre symbol, but with one crucial difference. Recall that Leg(x, pq) = 1 if and only if Leg(x, p) = 1 **and** Leg(x, q) = 1. However, Jac(x, pq) = Jac(x, p) × Jac(x, q), which means that Jac(x, pq) = 1 if Jac(x, p) = 1 and Jac(x, q) = 1 **or** if Jac(x, p) = -1 and Jac(x, q) = -1.

In the later case, x is not a quadratic residue mod n, despite the fact that Jax(x, n) = 1. Therefore, if Jac(x, n) = -1, x is guaranteed to be a nonresidue, but if Jac(x, n) = 1, there is no way to know whether x is a residue or not.

Another implication is that for any n, half the numbers coprime to n will have Jac(x, n) = 1 and half will have Jac(x, n) = -1. In the prime case, this is easy to see, since these are just the even and odd powers of a generator respectively. In the composite case, this follows from induction.

This means that if we have a way to calculate the Jacobi symbol, we can use it in place of the Legendre symbol in our original offline password guessing attack. If i is a square number, then Jac(iᵇ, n) = 1 for any b. But if we guess wrong, the calculated remainder s − 3iʰ will effectively be a randomly chosen number mod n and therefore a 50–50 chance of Jac(x, n) = 1 or -1. Therefore, we have a way to distinguish our password guesses as before. (I’m not sure if there is any way to actually prove that the remainder is effectively randomly distributed, but it works this way in practice so `¯\_(ツ)_/¯`).

It may not seem like we’ve gotten anywhere, since the definition of the Jacobi symbol still requires the factorization of n to calculate. However, a famous result in number theory, [The Law of Quadratic Reciprocity](https://en.wikipedia.org/wiki/Quadratic_reciprocity), provides a method to efficiently calculate the Jacobi symbol, even without knowing the factorization of the modulus. It’s a bit complicated, but you can find the formulas on [Wikipedia](https://en.wikipedia.org/wiki/Jacobi_symbol). Or you can see the implementation I wrote when solving the problem below (I made sure I could solve every challenge myself before posting them).

```py
_s2 = {1:1, 3:-1, 5:-1, 7:1}
def jacobi(a,n):
    a = a % n
    assert(a)

    res = 1
    while not a&1:
        res *= _s2[n % 8]
        a = a//2

    if a == 1:
        return res

    if n%4 == 3 and a%4 == 3:
        res = -res
    return res * jacobi(n, a)
```

This means that we now have a way to test password guesses without hitting the server, so we can start with a list of common passwords and go until we find one that works. As hinted in the welcome message, the password in this case is very weak. In fact, it is “Trustno1”, a password that is sure to appear on any list of commonly used passwords.

And that’s the solution for the “besquare” crypto challenge. Or at least, it is the solution I came up with. If you find any other methods to solve the problem, please tell me.

