jikes
=====

Web framework for beginners.

A lot of people start programming for the web.
Becasue web sites are understandable and accessible.
But let's face it: entry-level web technologies are shit.

Anecdote time!

When I was thirteen I was building a CMS (or so I thought), but I couldn't quite get the CREATE statements for the MySQL database to work.
I don't remember what I did wrong, because it was all just a black box to me.
Most of my code was copy-pasted from tutorials and adjusted to work in my case.
*Why?*
Because I had no idea what I was doing.
*No, why were you using MySQL for, like, your first project?*
Oh.

Well, I just did what I thought was normal.
When I started looking into how to build websites (after the initial static sites), the generally recommended way to go was PHP.
And MySQL.

The problem with PHP is that it encourages messing your data and your presentation layers together.
That's a ridiculously stupid idea, as any experienced developer will know.
Still, it's what we teach the new guys and gals.

The problem with MySQL is that it is just *too much*.
It's not actually needed for most simple projects.

**jikes** will totally solve this, by being just as accessible (or more so) than PHP and MySQL, while encouraging data separation and simple data storage (like, you know, the file system).

Cool. Let's get started.

Install it:

    npm install jikes -g

Launch it in a directory:

    jikes .

