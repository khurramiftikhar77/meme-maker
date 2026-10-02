// Built-in caption ideas for popular meme templates.
//
// names: template names (and aliases) as the sources spell them; matched ignoring case and punctuation.
// b:     optional text box layout, one [x, y, width, size] per box. x/y are the box centre and
//        width is a fraction of the image width; size is the font size as a fraction of the
//        image's shorter side. Templates without `b` use top/bottom (or evenly spaced) boxes.
// c:     caption ideas; each is one string per box, in the same order as `b`.
window.MEME_CAPTIONS = [
  {
    names: ['Drake Hotline Bling', 'Drakeposting', 'Drake'],
    b: [[0.75, 0.25, 0.48, 0.07], [0.75, 0.75, 0.48, 0.07]],
    c: [
      ['Fixing the bug', 'Adding a comment that says it is a feature'],
      ['Going to bed early', 'Watching one more episode at 3am'],
      ['Reading the instructions', 'Figuring it out after breaking it twice'],
      ['Saving money', 'Buying snacks I did not need'],
      ['Replying to the email', 'Hoping it resolves itself'],
      ['Doing the dishes now', 'Letting them soak for 3 days'],
    ],
  },
  {
    names: ['Two Buttons', 'Daily Struggle'],
    b: [[0.28, 0.14, 0.3, 0.05], [0.6, 0.1, 0.3, 0.05], [0.5, 0.88, 0.9, 0.07]],
    c: [
      ['Sleep', 'Scroll memes until 4am', 'Me at midnight'],
      ['Eat healthy', 'Order pizza again', 'Me on Monday'],
      ['Start the assignment', 'Clean my entire room', 'Me with a deadline tomorrow'],
      ['Save money', 'Treat myself', 'Me on payday'],
      ['Admit I am wrong', 'Change the subject', 'Me in every argument'],
    ],
  },
  {
    names: ['Distracted Boyfriend'],
    b: [[0.27, 0.68, 0.3, 0.06], [0.58, 0.45, 0.25, 0.06], [0.84, 0.6, 0.28, 0.06]],
    c: [
      ['A new hobby', 'Me', 'The 6 hobbies I already started'],
      ['Shiny new framework', 'Developers', 'The project that already works'],
      ['Online shopping', 'My wallet', 'My savings goal'],
      ['A random 3am thought', 'My brain', 'Sleep'],
      ['Another streaming service', 'Me', 'The 4 I already pay for'],
    ],
  },
  {
    names: ['UNO Draw 25 Cards'],
    b: [[0.25, 0.4, 0.3, 0.05], [0.75, 0.1, 0.45, 0.06]],
    c: [
      ['Say you were wrong', 'Me in an argument'],
      ['Read the terms and conditions', 'Everyone'],
      ['Ask for directions', 'Dads'],
      ['Stop watching after one episode', 'Me on a weeknight'],
      ['Close your 47 browser tabs', 'Me'],
    ],
  },
  {
    names: ['Left Exit 12 Off Ramp', 'Exit 12'],
    b: [[0.35, 0.2, 0.22, 0.045], [0.62, 0.2, 0.22, 0.045], [0.62, 0.78, 0.4, 0.06]],
    c: [
      ['Doing my work', 'Researching random facts for 3 hours', 'Me'],
      ['Being productive', 'Rearranging my desktop icons', 'My Sunday'],
      ['Going to the gym', 'Taking a nap', 'Me after work'],
      ['Answering the question', 'Telling a long story', 'My uncle'],
      ['Studying', 'Making a study playlist', 'Me before exams'],
    ],
  },
  {
    names: ['Bernie I Am Once Again Asking For Your Support', 'Bernie I Am Once Again Asking', 'I Am Once Again Asking'],
    c: [
      ['', 'I am once again asking you to reply to my message'],
      ['', 'I am once again asking you to put the dishes in the sink'],
      ['', 'I am once again asking for a 4 day work week'],
      ['', 'I am once again asking my code to just work'],
      ['', 'I am once again asking for one more week of vacation'],
    ],
  },
  {
    names: ['Change My Mind'],
    b: [[0.5, 0.08, 0.9, 0.06], [0.62, 0.72, 0.34, 0.05]],
    c: [
      ['', 'Pineapple belongs on pizza'],
      ['', 'Naps are a form of self care'],
      ['', 'Meetings could be emails'],
      ['', 'Breakfast for dinner is elite'],
      ['', 'Cats are just tiny landlords'],
    ],
  },
  {
    names: ["Gru's Plan", 'Grus Plan', 'Gru Plan'],
    b: [[0.33, 0.3, 0.22, 0.04], [0.83, 0.3, 0.22, 0.04], [0.33, 0.8, 0.22, 0.04], [0.83, 0.8, 0.22, 0.04]],
    c: [
      ['Start a diet', 'Buy healthy food', 'Get hungry at night', 'Get hungry at night'],
      ['Wake up early', 'Plan a productive day', 'Check my phone', 'Check my phone'],
      ['Learn to code', 'Watch a tutorial', 'Copy the code', 'Have no idea what it does'],
      ['Save money', 'Make a budget', 'See a sale', 'See a sale'],
    ],
  },
  {
    names: ['Batman Slapping Robin'],
    b: [[0.27, 0.1, 0.48, 0.055], [0.73, 0.1, 0.48, 0.055]],
    c: [
      ['Just one more episode', 'It is 4am'],
      ['It works on my machine', 'We are not shipping your machine'],
      ['I will start Monday', 'You said that last Monday'],
      ['Let me explain the plot of', 'No spoilers'],
      ['Can I copy your homework', 'Change it a little'],
    ],
  },
  {
    names: ['Waiting Skeleton', 'Waiting Skeleton Bench'],
    c: [
      ['Me waiting for', 'my food delivery'],
      ['Waiting for', 'the bus that said 2 min away'],
      ['Me waiting for', 'my crush to text back'],
      ['Waiting for', 'the code to compile'],
      ['Me waiting for', 'my friend who said 5 more minutes'],
    ],
  },
  {
    names: ['Disaster Girl'],
    c: [
      ['They said', 'it was just a small kitchen fire'],
      ['I only microwaved', 'a fork for a second'],
      ['When someone says', 'have fun at the office party'],
      ['Group project', 'after my part'],
      ['I just said', 'let me fix it real quick'],
    ],
  },
  {
    names: ['Woman Yelling At Cat', 'Woman Yelling at a Cat', 'Lady Yelling at Cat'],
    b: [[0.25, 0.1, 0.46, 0.055], [0.75, 0.1, 0.46, 0.055]],
    c: [
      ['You said you would be ready in 5 minutes', 'I said I would be ready. I never said when'],
      ['Who ate my leftovers', 'I do not know her'],
      ['You broke the build', 'It works on my machine'],
      ['You have to wake up early', 'Sleep is a social construct'],
      ['Why is the house a mess', 'Art takes time'],
    ],
  },
  {
    names: ['Expanding Brain', 'Galaxy Brain', 'Brain Expanding'],
    b: [[0.25, 0.125, 0.48, 0.05], [0.25, 0.375, 0.48, 0.05], [0.25, 0.625, 0.48, 0.05], [0.25, 0.875, 0.48, 0.05]],
    c: [
      ['Waking up early', 'Waking up on time', 'Waking up late', 'Never sleeping'],
      ['Writing tests', 'Testing manually', 'Testing in production', 'Users are the tests'],
      ['Studying', 'Watching study videos', 'Making study notes pretty', 'Praying'],
      ['Saving money', 'Spending wisely', 'Buying what is on sale', 'It was on sale so I saved money'],
    ],
  },
  {
    names: ['Always Has Been'],
    c: [
      ["Wait, it's all meetings?", 'Always has been'],
      ["Wait, it's all just copying from the internet?", 'Always has been'],
      ["Wait, adulthood is just being tired?", 'Always has been'],
      ["Wait, the plan was to wing it?", 'Always has been'],
      ["Wait, it's all snacks?", 'Always has been'],
    ],
  },
  {
    names: ['Buff Doge vs. Cheems', 'Buff Doge vs Cheems', 'Swole Doge vs Cheems'],
    b: [[0.25, 0.1, 0.46, 0.05], [0.75, 0.1, 0.46, 0.05], [0.25, 0.9, 0.46, 0.05], [0.75, 0.9, 0.46, 0.05]],
    c: [
      ['Kids in the 90s', 'Kids today', 'Played outside until dark', 'Phone battery at 20%, panic'],
      ['Old phones', 'New phones', 'Survived a 3 floor drop', 'Cracks if you look at it'],
      ['Me at 9am', 'Me at 5pm', 'I will finish everything today', 'I will finish everything tomorrow'],
      ['Grandma cooking', 'Me cooking', 'Feeds 20 people from nothing', 'Burns instant noodles'],
    ],
  },
  {
    names: ['Sad Pablo Escobar'],
    c: [
      ['Me waiting for the weekend', 'Weekend finally arrives', 'Sleeps through all of it'],
      ['Waiting for the food', 'Food arrives', 'They forgot my fries'],
      ['Everyone has plans', 'I have no plans', 'Still too tired to go out'],
      ['When the wifi is down', 'Phone data is gone', 'Forced to talk to family'],
    ],
  },
  {
    names: ['Tuxedo Winnie The Pooh', 'Tuxedo Winnie the Pooh', 'Fancy Winnie The Pooh'],
    b: [[0.7, 0.25, 0.56, 0.065], [0.7, 0.75, 0.56, 0.065]],
    c: [
      ['Eating cereal', 'Consuming a breakfast grain beverage'],
      ['Taking a nap', 'Strategic energy conservation'],
      ['I googled it', 'I conducted extensive research'],
      ['Copy and paste', 'Reusable code architecture'],
      ['Being late', 'Arriving fashionably'],
    ],
  },
  {
    names: ['Epic Handshake', 'Predator Handshake'],
    b: [[0.2, 0.62, 0.36, 0.055], [0.8, 0.62, 0.36, 0.055], [0.5, 0.3, 0.4, 0.06]],
    c: [
      ['Students', 'Teachers', 'Wanting the weekend'],
      ['Cats', 'Babies', 'Screaming at 3am for no reason'],
      ['Developers', 'Designers', 'Hating the client feedback'],
      ['Introverts', 'Cancelled plans', 'Pure happiness'],
      ['Me', 'My dog', 'Loving the couch'],
    ],
  },
  {
    names: ['Monkey Puppet', 'Awkward Look Monkey Puppet'],
    c: [
      ['When the teacher asks', 'who has not done the homework'],
      ['When someone says', 'the project is due today, not tomorrow'],
      ['When your mom asks', 'who ate all the cookies'],
      ['When the boss asks', 'who pushed to production on Friday'],
      ['When someone asks', 'if you read the group chat'],
    ],
  },
  {
    names: ['Anakin Padme 4 Panel', 'For The Better Right'],
    b: [[0.25, 0.42, 0.46, 0.045], [0.75, 0.42, 0.46, 0.045], [0.25, 0.92, 0.46, 0.045], [0.75, 0.92, 0.46, 0.045]],
    c: [
      ["I'm starting a new diet", 'Healthy food, right?', '', 'Healthy food, right?'],
      ["I'm going to fix the bug", 'Without breaking anything else, right?', '', 'Without breaking anything else, right?'],
      ["I'm taking a quick nap", 'Just 20 minutes, right?', '', 'Just 20 minutes, right?'],
      ["I'm going to the store", 'Only for milk, right?', '', 'Only for milk, right?'],
    ],
  },
  {
    names: ['Hide the Pain Harold', 'Hide The Pain Harold'],
    c: [
      ['When you laugh at the joke', 'you did not hear'],
      ['Me saying I am fine', 'after checking my bank account'],
      ['When the code works', 'and you have no idea why'],
      ['Smiling in the meeting', 'that could have been an email'],
      ['When the doctor asks', 'how much water you drink'],
    ],
  },
  {
    names: ['Mocking Spongebob', 'Spongebob Mocking'],
    c: [
      ['Just turn it off and on again', 'jUsT tUrN iT oFf AnD oN aGaIn'],
      ['You should drink more water', 'yOu ShOuLd DrInK mOrE wAtEr'],
      ['Did you even read the brief', 'dId YoU eVeN rEaD tHe BrIeF'],
      ['It is just a game', 'iT iS jUsT a GaMe'],
      ['Money cannot buy happiness', 'mOnEy CaNnOt BuY hApPiNeSs'],
    ],
  },
  {
    names: ['Roll Safe Think About It', 'Roll Safe', 'Think About It'],
    c: [
      ['You cannot be late to work', 'if you never leave the office'],
      ['You cannot fail the exam', 'if you do not take it'],
      ['Cannot have a messy room', 'if you never go home'],
      ['You cannot lose your keys', 'if you never lock the door'],
      ['Cannot get bad grades', 'if you never check your grades'],
    ],
  },
  {
    names: ['Is This A Pigeon', 'Is This a Butterfly'],
    b: [[0.78, 0.22, 0.4, 0.055], [0.3, 0.58, 0.45, 0.055], [0.5, 0.9, 0.95, 0.065]],
    c: [
      ['A single cloud', 'Me with a picnic planned', 'Is this a storm?'],
      ['Any bug', 'Junior developer', 'Is this a feature?'],
      ['Spending 2 minutes outside', 'Me', 'Is this a workout?'],
      ['A cheese slice', 'Me at midnight', 'Is this dinner?'],
      ['Turning it off and on', 'Me', 'Is this IT support?'],
    ],
  },
  {
    names: ['Trade Offer'],
    b: [[0.25, 0.3, 0.4, 0.055], [0.75, 0.3, 0.4, 0.055]],
    c: [
      ['I receive: your fries', 'You receive: my love'],
      ['I receive: the remote', 'You receive: a hug'],
      ['I receive: the last slice', 'You receive: a thank you'],
      ['I receive: your homework', 'You receive: my friendship'],
      ['I receive: 8 hours of sleep', 'You receive: a functional me'],
    ],
  },
  {
    names: ['X, X Everywhere', 'X X Everywhere', 'Buzz Lightyear Everywhere'],
    c: [
      ['Bugs', 'Bugs everywhere'],
      ['Meetings', 'Meetings everywhere'],
      ['Ads', 'Ads everywhere'],
      ['Spoilers', 'Spoilers everywhere'],
      ['Cat hair', 'Cat hair everywhere'],
    ],
  },
  {
    names: ["Y'all Got Any More Of That", 'Yall Got Any More Of That', 'Dave Chappelle'],
    c: [
      ["Y'all got any more of that", 'free time'],
      ["Y'all got any more of that", 'weekend'],
      ["Y'all got any more of them", 'paid holidays'],
      ["Y'all got any more of that", 'motivation'],
      ["Y'all got any more of that", 'free pizza from the meeting'],
    ],
  },
  {
    names: ['One Does Not Simply', 'One Does Not Simply Walk into Mordor', 'Boromir'],
    c: [
      ['One does not simply', 'eat just one chip'],
      ['One does not simply', 'close one browser tab'],
      ['One does not simply', 'leave a family gathering'],
      ['One does not simply', 'fix a bug without making two more'],
      ['One does not simply', 'take a 20 minute nap'],
    ],
  },
  {
    names: ['Ancient Aliens', 'Ancient Aliens Guy'],
    c: [
      ['I am not saying it was aliens', 'but it was aliens'],
      ['Lost my left sock', 'aliens'],
      ['Code started working', 'aliens'],
      ['My snacks are gone', 'aliens'],
      ['Woke up tired after 9 hours', 'aliens'],
    ],
  },
  {
    names: ['Futurama Fry', 'Not Sure If Trolling', 'Not Sure If'],
    c: [
      ['Not sure if hungry', 'or just bored'],
      ['Not sure if the code works', 'or the bug is hiding'],
      ['Not sure if tired', 'or tired of everything'],
      ['Not sure if they are joking', 'or I should be worried'],
      ['Not sure if it is a nap', 'or I am asleep for the night'],
    ],
  },
  {
    names: ['Clown Applying Makeup'],
    b: [[0.25, 0.125, 0.48, 0.045], [0.25, 0.375, 0.48, 0.045], [0.25, 0.625, 0.48, 0.045], [0.25, 0.875, 0.48, 0.045]],
    c: [
      ['I will just check my phone', 'For one minute', 'Before I start working', '3 hours later'],
      ['This deploy is small', 'What could go wrong', "It's Friday at 5pm", 'Pushing anyway'],
      ['I will buy just one thing', 'It is on sale', 'Free shipping over $50', 'Spent $120'],
      ['Just one episode', 'It is only 40 minutes', 'Season finale is next', 'Sunrise'],
    ],
  },
  {
    names: ['This Is Fine', 'This is Fine Dog'],
    c: [
      ['My inbox on Monday', 'this is fine'],
      ['Me during finals week', 'this is fine'],
      ['Production at 5pm Friday', 'this is fine'],
      ['My bank account after the weekend', 'this is fine'],
      ['Adulting', 'this is fine'],
    ],
  },
  {
    names: ['Panik Kalm Panik', 'Panik Kalm', 'Panik'],
    b: [[0.25, 0.167, 0.48, 0.05], [0.25, 0.5, 0.48, 0.05], [0.25, 0.833, 0.48, 0.05]],
    c: [
      ['Exam tomorrow', 'It got postponed', 'To today'],
      ['Phone is gone', 'It was in my hand', 'Now it is at 1%'],
      ['Boss wants to talk', 'He wants to give a raise', 'To someone else'],
      ['Code is broken', 'Found the bug', 'It is in production'],
    ],
  },
  {
    names: ['Leonardo Dicaprio Cheers', 'Leonardo DiCaprio Cheers', 'Leo Toast'],
    c: [
      ['To everyone who', 'replies on the first message'],
      ['Here is to the people', 'who return shopping carts'],
      ['Cheers to the friend', 'who always has snacks'],
      ['To the dev who', 'wrote comments in the code'],
      ['Cheers to', 'surviving another Monday'],
    ],
  },
  {
    names: ['Oprah You Get A', 'Oprah You Get A Car'],
    c: [
      ['You get a bug', 'everybody gets a bug'],
      ['You get a meeting', 'everybody gets a meeting'],
      ['You get a nap', 'everybody gets a nap'],
      ['You get homework', 'everybody gets homework'],
      ['You get a group chat notification', 'everybody gets one'],
    ],
  },
  {
    names: ['Evil Kermit', 'Kermit Hood'],
    c: [
      ['Me: I should go to sleep', 'Also me: watch one more video'],
      ['Me: I will save money', 'Also me: it is on sale, buy it'],
      ['Me: I will eat healthy', 'Also me: order the large fries'],
      ['Me: study for the exam', 'Also me: you can learn it the night before'],
      ['Me: be productive today', 'Also me: reorganize your playlist'],
    ],
  },
  {
    names: ['Hard To Swallow Pills', 'Hard to Swallow Pills'],
    c: [
      ['Hard to swallow pills', 'Nobody reads the email you spent 2 hours on'],
      ['Hard to swallow pills', 'Your plants need water too'],
      ['Hard to swallow pills', 'The gym will not go to itself'],
      ['Hard to swallow pills', 'Monday comes every week'],
      ['Hard to swallow pills', 'Coffee is not a meal'],
    ],
  },
  {
    names: ['Surprised Pikachu', 'Shocked Pikachu'],
    b: [[0.5, 0.06, 0.95, 0.045], [0.5, 0.15, 0.95, 0.045], [0.5, 0.24, 0.95, 0.045]],
    c: [
      ['Me: stays up until 3am', 'Me: wakes up at 7am', 'Me: why am I so tired'],
      ['Me: skips testing', 'Production: breaks', 'Me:'],
      ['Me: leaves food out', 'Cat: eats it', 'Me:'],
      ['Me: does not study', 'Exam: is hard', 'Me:'],
      ['Me: says I will remember', 'Me: does not write it down', 'Me: forgets'],
    ],
  },
  {
    names: ['Spongebob Ight Imma Head Out', 'Ight Imma Head Out'],
    c: [
      ['When someone says', 'let us discuss this in one more meeting'],
      ['When the party', 'starts playing slow music'],
      ['Me when family', 'starts asking about my grades'],
      ['When the teacher says', 'we will have a pop quiz'],
      ['When the host says', 'help clean up'],
    ],
  },
  {
    names: ['Laughing Leo', 'Leonardo Laughing'],
    c: [
      ['When the bug', 'is in someone else\'s code'],
      ['When you get the last slice', 'and everyone else is still in line'],
      ['When the teacher forgets', 'to collect the homework'],
      ['When the meeting', 'gets cancelled'],
      ['When your friend trips', 'and you are not hurt'],
    ],
  },
  {
    names: ['Who Would Win?', 'Who Would Win'],
    b: [[0.25, 0.5, 0.46, 0.06], [0.75, 0.5, 0.46, 0.06]],
    c: [
      ['A 10,000 line codebase', 'One missing semicolon'],
      ['My diet plan', 'One free donut'],
      ['8 hours of sleep', 'One notification'],
      ['A whole army', 'One Lego on the floor'],
      ['My willpower', 'A sale sign'],
    ],
  },
  {
    names: ['Sleeping Shaq'],
    c: [
      ['My alarm going off', 'and me ignoring it'],
      ['Teacher explaining', 'me during the lesson'],
      ['Responsibilities calling', 'me on a Sunday'],
      ['Mom yelling my name', 'me pretending to be asleep'],
      ['Notifications at night', 'me wide awake at 3am'],
    ],
  },
  {
    names: ['Success Kid', 'Success Baby'],
    c: [
      ['Found money', 'in my old jacket'],
      ['Code worked', 'on the first try'],
      ['Woke up', 'before my alarm'],
      ['Made it home', 'before the rain'],
      ['Got the last cookie', 'nobody noticed'],
    ],
  },
  {
    names: ['Brace Yourselves X is Coming', 'Brace Yourselves', 'Imminent Ned'],
    c: [
      ['Brace yourselves', 'Monday is coming'],
      ['Brace yourselves', 'exam season is coming'],
      ['Brace yourselves', 'holiday family questions are coming'],
      ['Brace yourselves', 'the end of the month is coming'],
      ['Brace yourselves', 'pumpkin spice is coming'],
    ],
  },
  {
    names: ['Grandma Finds The Internet', 'Grandma Finds the Internet'],
    c: [
      ['Types google', 'into google'],
      ['Sends good morning', 'to the whole family group at 5am'],
      ['Shares a news story', 'from 2009'],
      ['Leaves a comment', 'thanking the YouTuber by name'],
      ['Writes the whole message', 'in capital letters'],
    ],
  },
  {
    names: ['Matrix Morpheus', 'What If I Told You', 'Morpheus'],
    c: [
      ['What if I told you', 'you can just close the tabs'],
      ['What if I told you', 'the fridge has not changed in 5 minutes'],
      ['What if I told you', 'you do not have to finish every series'],
      ['What if I told you', 'naps count as self care'],
      ['What if I told you', 'the bug was a missing comma'],
    ],
  },
  {
    names: ['Bad Luck Brian'],
    c: [
      ['Finally gets a day off', 'it rains'],
      ['Buys a new phone', 'drops it the same day'],
      ['Studies all night', 'exam is postponed'],
      ['Wins a free trip', 'for one, to the dentist'],
      ['Gets a text', 'it is from the bank'],
    ],
  },
  {
    names: ['First World Problems', 'First World Problems Girl'],
    c: [
      ['My phone is at 20%', 'and the charger is all the way over there'],
      ['Too many shows', 'and nothing to watch'],
      ['Wifi does not reach', 'the bathroom'],
      ['Ice cream is too frozen', 'to scoop'],
      ['The fries came', 'without ketchup'],
    ],
  },
  {
    names: ['Captain Picard Facepalm', 'Picard Facepalm', 'Facepalm'],
    c: [
      ['When you search for your phone', 'while it is in your hand'],
      ['When you spend 2 hours debugging', 'and it was a typo'],
      ['When you hit reply all', 'by mistake'],
      ['When you push the door', 'that says pull'],
      ['When you forget', 'why you walked into the room'],
    ],
  },
  {
    names: ['Jack Sparrow Being Chased'],
    c: [
      ['Me', 'my responsibilities'],
      ['Me on the weekend', 'every email from work'],
      ['Me leaving the party early', 'everyone asking why'],
      ['Me with the last slice', 'my siblings'],
      ['Me', 'deadlines'],
    ],
  },
  {
    names: ['Car Salesman Slaps Roof Of Car', 'Car Salesman Slaps Hood', 'Slaps Roof Of Car'],
    c: [
      ['*Slaps roof of laptop*', 'This bad boy can fit so many open tabs in it'],
      ['*Slaps roof of fridge*', 'This bad boy can fit so many leftovers in it'],
      ['*Slaps roof of group chat*', 'This bad boy can fit so many memes in it'],
      ['*Slaps roof of closet*', 'This bad boy can fit so many clothes I never wear'],
      ['*Slaps roof of brain*', 'This bad boy can fit so many useless facts'],
    ],
  },
  {
    names: ['Guy Holding Cardboard Sign', 'Cardboard Sign'],
    c: [
      ['', 'Will work for snacks'],
      ['', 'Need sleep. Anything helps'],
      ['', 'Please reply to my email'],
      ['', 'Free hugs, no refunds'],
      ['', 'Will debug for coffee'],
    ],
  },
  {
    names: ["Lisa Simpson's Presentation", 'Lisa Simpson Presentation', 'Lisa Presentation'],
    b: [[0.5, 0.33, 0.7, 0.06]],
    c: [
      ['Coffee is a personality'],
      ['Naps should be part of the work day'],
      ['A meeting without an agenda is a hostage situation'],
      ['Leftovers are better the next day'],
      ['The group chat does not need to be at 3am'],
    ],
  },
  {
    names: ['Megamind peeking', 'Megamind Peeking', 'No Bitches Megamind'],
    c: [
      ['No', 'weekend?'],
      ['No', 'sleep?'],
      ['No', 'tests?'],
      ['No', 'snacks?'],
      ['No', 'replies?'],
    ],
  },
  {
    names: ['Two guys on a bus', 'Two Guys On A Bus'],
    b: [[0.25, 0.25, 0.45, 0.055], [0.75, 0.25, 0.45, 0.055]],
    c: [
      ['People who planned ahead', 'Me the night before the deadline'],
      ['People enjoying the weekend', 'Me remembering Monday exists'],
      ['Friends with savings', 'Me after one online sale'],
      ['People who sleep at 10pm', 'Me watching the sunrise'],
      ['Students who studied', 'Me guessing every answer'],
    ],
  },
  {
    names: ['Scroll Of Truth', 'Scroll of Truth'],
    c: [
      ['Reads the scroll of truth', 'You should go to bed now'],
      ['Reads the scroll of truth', 'The problem is your code'],
      ['Reads the scroll of truth', 'You do not need another hoodie'],
      ['Reads the scroll of truth', 'Monday is coming'],
      ['Reads the scroll of truth', 'You left the stove on'],
    ],
  },
  {
    names: ['Blank Nut Button', 'Nut Button'],
    c: [
      ['Me seeing', 'free food'],
      ['Me when the teacher says', 'class is cancelled'],
      ['Me when it is', 'Friday at 5pm'],
      ['When someone says', 'pizza is here'],
      ['Me seeing', 'a sale'],
    ],
  },
  {
    names: ["But That's None Of My Business", 'But Thats None Of My Business', 'Kermit Tea'],
    c: [
      ['You say you are on a diet', 'but that is none of my business'],
      ['Your code has no comments', 'but that is none of my business'],
      ['You said you would call back', 'but that is none of my business'],
      ['You owe me 20 dollars', 'but that is none of my business'],
      ['You said one more episode', 'but that is none of my business'],
    ],
  },
  {
    names: ['Unsettled Tom'],
    c: [
      ['When someone says', 'they do not like pizza'],
      ['When the doctor says', 'this might hurt a little'],
      ['When the code works', 'and you did not change anything'],
      ['When someone says', 'we need to talk'],
      ['When mom says', 'come here for a second'],
    ],
  },
  {
    names: ["I Bet He's Thinking About Other Women", 'I Bet Hes Thinking About Other Women'],
    c: [
      ['I bet he is thinking about other women', 'Why did that code work yesterday'],
      ['I bet he is thinking about other women', 'Did I leave the oven on'],
      ['I bet he is thinking about other women', 'What if dogs had thumbs'],
      ['I bet he is thinking about other women', 'One more round and I will sleep'],
      ['I bet he is thinking about other women', 'Was it the second or third left turn'],
    ],
  },
  {
    names: ['Afraid To Ask Andy', 'Afraid to Ask Andy'],
    c: [
      ['I do not know what a 401k is', 'and at this point I am too afraid to ask'],
      ['I do not know how the project works', 'and at this point I am too afraid to ask'],
      ['I still do not know my neighbor\'s name', 'and at this point I am too afraid to ask'],
      ['I do not get the joke', 'and at this point I am too afraid to ask'],
      ['I do not know what my job title means', 'and at this point I am too afraid to ask'],
    ],
  },
  {
    names: ['Grumpy Cat'],
    c: [
      ['I had fun once', 'it was awful'],
      ['Good morning', 'no'],
      ['Monday', 'is the worst'],
      ['Smile, they said', 'no'],
      ['I like people', 'said no one ever'],
    ],
  },
  {
    names: ['Yo Dawg Heard You', 'Yo Dawg', 'Xzibit'],
    c: [
      ['Yo dawg, I heard you like meetings', 'so we scheduled a meeting about meetings'],
      ['Yo dawg, I heard you like snacks', 'so I put snacks in your snacks'],
      ['Yo dawg, I heard you like bugs', 'so we added bugs to your bug fix'],
      ['Yo dawg, I heard you like naps', 'so we made your nap take a nap'],
      ['Yo dawg, I heard you like memes', 'so I put a meme in your meme'],
    ],
  },
  {
    names: ['Mugatu So Hot Right Now', 'So Hot Right Now'],
    c: [
      ['Naps', 'so hot right now'],
      ['Working from home', 'so hot right now'],
      ['Cancelled plans', 'so hot right now'],
      ['Drinking water', 'so hot right now'],
      ['Going to bed at 9', 'so hot right now'],
    ],
  },
  {
    names: ['Put It Somewhere Else Patrick', 'Push It Somewhere Else Patrick'],
    c: [
      ['We should fix the bug', 'No, we move the bug somewhere else'],
      ['We should clean the room', 'No, we move the mess into the closet'],
      ['We should pay off the debt', 'No, we put it on another card'],
      ['We should finish the project', 'No, we push the deadline'],
      ['We should answer the email', 'No, we mark it unread'],
    ],
  },
  {
    names: ['Arthur Fist', 'Clenched Fist'],
    c: [
      ['When someone says', 'it is just a small change'],
      ['When the wifi drops', 'during the final round'],
      ['When people chew', 'loudly in the library'],
      ['When someone spoils', 'the ending'],
      ['When the delivery', 'is 1 minute late'],
    ],
  },
  {
    names: ['Creepy Condescending Wonka', 'Condescending Wonka'],
    c: [
      ['Oh, you will start the diet on Monday?', 'Tell me more about that'],
      ['You will be ready in 5 minutes?', 'Please, tell me again'],
      ['So you read the documentation?', 'How interesting'],
      ['You only buy what you need?', 'Fascinating'],
      ['You will sleep early tonight?', 'Do go on'],
    ],
  },
  {
    names: ['Uncle Sam', 'I Want You'],
    c: [
      ['I want you', 'to reply to the group chat'],
      ['I want you', 'to stop leaving dishes in the sink'],
      ['I want you', 'to write tests'],
      ['I want you', 'to drink some water'],
      ['I want you', 'to go to bed'],
    ],
  },
  {
    names: ['Dr Evil Laser', 'Dr. Evil Laser', 'Dr Evil Air Quotes'],
    c: [
      ['A "quick" meeting', ''],
      ['A "small" change', ''],
      ['A "5 minute" walk', ''],
      ['Just "one" episode', ''],
      ['"Healthy" snacks', ''],
    ],
  },
  {
    names: ['Aaaaand Its Gone', 'And Its Gone'],
    c: [
      ['Paycheck arrives', 'aaaaand it is gone'],
      ['Motivation in the morning', 'aaaaand it is gone'],
      ['Had a great idea', 'aaaaand it is gone'],
      ['Bought snacks for the week', 'aaaaand they are gone'],
      ['Phone at 100%', 'aaaaand it is gone'],
    ],
  },
  {
    names: ['Mr Krabs Blur Meme', 'Confused Mr Krabs', 'Mr Krabs Blur'],
    c: [
      ['Me trying to understand', 'my own code from last week'],
      ['Me reading', 'the exam questions'],
      ['Me when the teacher', 'skips 4 steps'],
      ['Me when someone asks', 'what my plans are for the future'],
      ['Me trying to follow', 'the group chat after 200 messages'],
    ],
  },
  {
    names: ['They\'re The Same Picture', 'Theyre The Same Picture', 'Corporate Needs You To Find The Differences'],
    c: [
      ['Corporate needs you to find the differences between this picture and this picture', 'They are the same picture'],
      ['Find the difference between a meeting and an email', 'They are the same picture'],
      ['Find the difference between Monday and Tuesday', 'They are the same picture'],
      ['Find the difference between my code and the tutorial', 'They are the same picture'],
    ],
  },
  {
    names: ['Look At Me', 'Look At Me Im The Captain Now', 'Captain Phillips'],
    c: [
      ['Look at me', 'I am the adult now'],
      ['Look at me', 'I am the senior developer now'],
      ['Look at me', 'I am the group leader now'],
      ['Look at me', 'I make the playlist now'],
      ['Look at me', 'I am the chef now'],
    ],
  },
  {
    names: ['Star Wars Yoda', 'Yoda'],
    c: [
      ['Sleep you must', 'tired you are'],
      ['Commit often', 'lose work you will not'],
      ['Study you will', 'tomorrow, always tomorrow'],
      ['Snacks you seek', 'empty the fridge is'],
      ['Weekend it is', 'nothing you will do'],
    ],
  },
  {
    names: ['Philosoraptor'],
    c: [
      ['If you try to fail and succeed', 'did you fail or succeed?'],
      ['If I eat myself', 'do I get twice as big or disappear?'],
      ['If nothing is impossible', 'is it possible to fail?'],
      ['If money does not grow on trees', 'why do banks have branches?'],
      ['If you clean a vacuum', 'are you the vacuum cleaner?'],
    ],
  },
  {
    names: ['Third World Skeptical Kid'],
    c: [
      ['So you are telling me', 'you pay for water in a bottle?'],
      ['So you are telling me', 'you have a phone and still do not reply?'],
      ['So you are telling me', 'the meeting could have been an email?'],
      ['So you are telling me', 'you have 3 streaming apps and nothing to watch?'],
      ['So you are telling me', 'you bought a gym membership in January?'],
    ],
  },
  {
    names: ['Inhaling Seagull'],
    c: [
      ['Me', 'when someone', 'says the', 'answer is in the email'],
      ['When', 'the teacher', 'says', 'open book exam'],
      ['Me', 'seeing', 'free', 'pizza'],
      ['When', 'mom says', 'we have food', 'at home'],
    ],
  },
  {
    names: ['Spider Man Triple', 'Spiderman Pointing at Spiderman', 'Spider-Man Pointing', 'Spiderman Pointing'],
    c: [
      ['Me', 'also me'],
      ['Developers', 'testers'],
      ['My plans', 'my excuses'],
      ['The bug', 'the fix'],
      ['Monday me', 'Friday me'],
    ],
  },
  {
    names: ['Mother Ignoring Kid Drowning In A Pool'],
    c: [
      ['Me', 'My new project', 'My old projects'],
      ['Me', 'New phone', 'Old phone'],
      ['Teacher', 'Smart kid', 'Me'],
      ['Me', 'Latest series', 'The 5 shows I never finished'],
    ],
  },
  {
    names: ['Soldier protecting sleeping child', 'Soldier Protecting Sleeping Child'],
    c: [
      ['Me', 'My 8 hours of sleep', 'Every notification'],
      ['Mom', 'Leftovers', 'Me at midnight'],
      ['My antivirus', 'My computer', 'One suspicious download'],
      ['Me', 'My weekend', 'Work emails'],
    ],
  },
  {
    names: ['Gus Fring we are not the same', 'Gus Fring We Are Not The Same', 'We Are Not The Same'],
    c: [
      ['You sleep to rest', 'I sleep to skip being hungry', 'We are not the same'],
      ['You study to pass', 'I pray to pass', 'We are not the same'],
      ['You save money', 'I save memes', 'We are not the same'],
      ['You test your code', 'I test my luck', 'We are not the same'],
    ],
  },
  {
    names: ['Average Fan vs Average Enjoyer', 'Average Enjoyer'],
    b: [[0.25, 0.1, 0.46, 0.05], [0.75, 0.1, 0.46, 0.05]],
    c: [
      ['Average energy drink fan', 'Average 9 hours of sleep enjoyer'],
      ['Average gym bro', 'Average nap enjoyer'],
      ['Average hustle culture fan', 'Average weekend off enjoyer'],
      ['Average tea spiller', 'Average minding my own business enjoyer'],
    ],
  },
  {
    names: ['Who Killed Hannibal'],
    c: [
      ['Me', 'Eating the last cookie', 'Who ate the last cookie?'],
      ['Developer', 'Writing the bug', 'Why is this broken?'],
      ['Me', 'Spending all my money', 'Where did my money go?'],
      ['Me', 'Staying up late', 'Why am I so tired?'],
    ],
  },
  {
    names: ['American Chopper Argument'],
    c: [
      ['Tabs are better', 'Spaces are better', 'Tabs!', 'Spaces!', 'Can we just ship it'],
      ['Pineapple goes on pizza', 'It absolutely does not', 'It is sweet and salty', 'It is fruit!', 'Tomato is a fruit too'],
      ['Cats are better', 'Dogs are better', 'Cats are independent', 'Dogs love you', 'Get both'],
    ],
  },
  {
    names: ['Finding Neverland'],
    c: [
      ['Me', 'Watching', 'Leaving the group chat on read'],
      ['When you', 'realize', 'tomorrow is Monday'],
      ['Me', 'Seeing', 'my exam results'],
    ],
  },
  {
    names: ['Boardroom Meeting Suggestion'],
    c: [
      ['How do we fix the bug?', 'Add more tests', 'Read the logs', 'Delete the feature', ''],
      ['How do we save money?', 'Budget better', 'Cook at home', 'Stop buying snacks', ''],
      ['How do we improve morale?', 'Pizza party', 'Bonuses', 'Fewer meetings', ''],
    ],
  },
  {
    names: ['Sad Keanu'],
    c: [
      ['When the food arrives', 'and it is the wrong order'],
      ['When the weekend', 'is already over'],
      ['When you check the fridge', 'for the 5th time'],
    ],
  },
  {
    names: ["Bike Fall", "Bicycle Fall", "Stick In Bike Wheel"],
    c: [
      ["Me", "Staying up until 3am", "Why am I always tired?"],
      ["Me", "Not studying", "Why are exams so hard?"],
      ["Developers", "Pushing on Friday", "Why is production down?"],
      ["Me", "Buying snacks", "Why can't I save money?"],
      ["Me", "Saying \"five more minutes\"", "Why am I always late?"],
    ],
  },
  {
    names: ["The Rock Driving", "Rock Driving"],
    c: [
      ["What is your favourite day?", "Monday"],
      ["Did you save the file?", "What file?"],
      ["Want to hear my plan?", "I have not slept in 3 days"],
      ["How much did you spend?", "Only a little, on everything"],
      ["Did you do the homework?", "Which homework?"],
    ],
  },
  {
    names: ["Marked Safe From"],
    c: [
      ["Marked safe from", "Monday morning meetings"],
      ["Marked safe from", "doing the dishes today"],
      ["Marked safe from", "small talk at the party"],
      ["Marked safe from", "the group project"],
      ["Marked safe from", "being productive today"],
    ],
  },
  {
    names: ["Confused Gandalf", "Gandalf No Memory"],
    c: [
      ["When you open your old code", "I have no memory of this place"],
      ["Me reading my own notes", "before the exam"],
      ["When someone says", "remember when we met?"],
      ["Me walking into a room", "and forgetting why"],
      ["Monday me", "looking at Friday me's to-do list"],
    ],
  },
  {
    names: ["Kombucha Girl"],
    c: [
      ["Trying a new food", "Actually liking it"],
      ["Hearing the new song once", "Hearing it a fifth time"],
      ["Monday", "Remembering Friday exists"],
      ["Opening the bill", "Seeing the discount"],
      ["Starting the gym", "Seeing the results"],
    ],
  },
  {
    names: ["Shut Up And Take My Money Fry", "Shut Up And Take My Money"],
    c: [
      ["A pillow that is always cold", "Shut up and take my money"],
      ["Pizza that delivers itself", "Shut up and take my money"],
      ["A 4 day work week", "Shut up and take my money"],
      ["Socks that never get lost", "Shut up and take my money"],
      ["An alarm that lets me sleep in", "Shut up and take my money"],
    ],
  },
  {
    names: ["Black Girl Wat", "Wat Girl"],
    c: [
      ["When someone says", "pineapple pizza is the best"],
      ["When the teacher says", "the exam is open book but you still fail"],
      ["When someone says", "they reply to emails on weekends"],
      ["When someone says", "they do not like weekends"],
      ["When they say", "the meeting is mandatory and unpaid"],
    ],
  },
  {
    names: ["Domino Effect"],
    c: [
      ["One \"small\" bug fix", "The whole app breaking"],
      ["Skipping breakfast", "Ordering a giant lunch"],
      ["One more episode", "Missing the morning alarm"],
      ["Saying yes once", "Becoming the office IT guy"],
      ["Buying one plant", "Owning a jungle"],
    ],
  },
  {
    names: ["Imagination Spongebob", "Spongebob Imagination", "Spongebob Rainbow"],
    c: [
      ["Free entertainment", "Imagination"],
      ["How I will pay my bills", "Imagination"],
      ["My plans for the weekend", "Imagination"],
      ["How I finished the essay", "Imagination"],
      ["My gym progress", "Imagination"],
    ],
  },
  {
    names: ["Disappointed Black Guy", "Disappointed Guy"],
    c: [
      ["When the \"free\" app", "has a subscription"],
      ["When the movie", "is nothing like the book"],
      ["When you order the big pizza", "and it is still small"],
      ["When the sequel", "ruins the first movie"],
      ["When the fries", "are cold"],
    ],
  },
  {
    names: ["Sweating Jordan Peele", "Jordan Peele Sweating", "Key And Peele Sweating"],
    c: [
      ["When the teacher asks", "who has not done the homework"],
      ["Me at the airport", "not sure if my bag is overweight"],
      ["When the boss says", "can you show me your screen"],
      ["When mom asks", "who broke the vase"],
      ["Me watching a movie with my parents", "when a kissing scene starts"],
    ],
  },
  {
    names: ["Sad Affleck", "Sad Ben Affleck"],
    c: [
      ["When the weekend", "is over already"],
      ["Hearing your own voice", "in a recording"],
      ["When the sequel", "is announced and then cancelled"],
      ["When your favourite show", "gets a bad ending"],
      ["When you remember", "tomorrow is Monday"],
    ],
  },
  {
    names: ["Crying Michael Jordan", "Crying Jordan"],
    c: [
      ["When your team", "loses in the final minute"],
      ["When the pizza", "falls cheese side down"],
      ["When the exam results", "come out"],
      ["When the server", "goes down on launch day"],
      ["When you see the price", "after tax"],
    ],
  },
  {
    names: ["Overly Attached Girlfriend"],
    c: [
      ["I saw you went online", "why did you not text me"],
      ["I made us matching profiles", "so we can always be together"],
      ["You said see you later", "so I am outside"],
      ["I read your messages", "just to check on you"],
      ["I have saved your number", "under \"forever\""],
    ],
  },
  {
    names: ["Scumbag Steve"],
    c: [
      ["Borrows your charger", "gives it back with 1% battery"],
      ["Eats your leftovers", "leaves the empty box in the fridge"],
      ["Says he will pay you back", "moves to another city"],
      ["Joins the group project", "on presentation day"],
      ["Asks to borrow a pen", "keeps it forever"],
    ],
  },
  {
    names: ["Good Guy Greg"],
    c: [
      ["Borrows your car", "returns it with a full tank"],
      ["Sees you have no lunch", "shares his"],
      ["Joins the group project", "does the whole thing"],
      ["Eats the last slice", "orders another pizza"],
      ["Sends you a meme", "explains it when you do not get it"],
    ],
  },
  {
    names: ["Socially Awkward Penguin", "Awkward Penguin"],
    c: [
      ["Someone says \"have a good flight\"", "\"you too\""],
      ["Sees someone I know in the shop", "hides behind the cereal"],
      ["Gets a phone call", "lets it ring until it stops"],
      ["Someone waves", "waves back at the person behind me"],
      ["Rehearses ordering pizza", "still says it wrong"],
    ],
  },
  {
    names: ["Insanity Wolf"],
    c: [
      ["Eats cereal", "with orange juice"],
      ["Sleeps 2 hours", "goes to the gym twice"],
      ["Charges phone", "to 101%"],
      ["Microwaves leftovers", "for 40 minutes"],
      ["Reads the ending first", "then the beginning"],
    ],
  },
  {
    names: ["Conspiracy Keanu"],
    c: [
      ["What if the fridge light", "stays on when the door is closed"],
      ["What if socks disappear", "because they are going home"],
      ["What if we are the aliens", "and they are just visiting"],
      ["What if the snooze button", "is a test"],
      ["What if cats know", "and they are just not telling us"],
    ],
  },
  {
    names: ["The Most Interesting Man In The World", "Most Interesting Man"],
    c: [
      ["I do not always eat vegetables", "but when I do, they are on a pizza"],
      ["I do not always wake up early", "but when I do, I go back to sleep"],
      ["I do not always test my code", "but when I do, I do it in production"],
      ["I do not always read the instructions", "but when I do, it is after I broke it"],
      ["I do not always go to the gym", "but when I do, I post about it"],
    ],
  },
  {
    names: ["Too Damn High", "The Rent Is Too Damn High"],
    c: [
      ["The rent", "is too damn high"],
      ["The price of coffee", "is too damn high"],
      ["The number of meetings", "is too damn high"],
      ["My screen time", "is too damn high"],
      ["The pile of laundry", "is too damn high"],
    ],
  },
  {
    names: ["Dwight Schrute", "Dwight False"],
    c: [
      ["Naps are a waste of time", "False. Naps are a lifestyle"],
      ["Coffee is just a drink", "False. It is a personality"],
      ["Monday is a normal day", "False"],
      ["You only need one charger", "False. You need one in every room"],
      ["One slice is enough", "False"],
    ],
  },
  {
    names: ["Charlie Conspiracy (Always Sunny in Philidelphia)", "Charlie Conspiracy", "Pepe Silvia"],
    c: [
      ["Me explaining", "why I need another hoodie"],
      ["Me explaining", "where my money went this month"],
      ["Me explaining", "the plot of the show I just started"],
      ["Me explaining", "why the bug is not my fault"],
      ["Me explaining", "the group chat drama"],
    ],
  },
  {
    names: ["Pepperidge Farm Remembers"],
    c: [
      ["Remember when phones had buttons?", "Pepperidge Farm remembers"],
      ["Remember when we had summer holidays?", "Pepperidge Farm remembers"],
      ["Remember when rent was affordable?", "Pepperidge Farm remembers"],
      ["Remember when the internet made a noise?", "Pepperidge Farm remembers"],
      ["Remember when I had free time?", "Pepperidge Farm remembers"],
    ],
  },
  {
    names: ["Am I The Only One Around Here", "Walter Sobchak"],
    c: [
      ["Am I the only one around here", "who puts the dishes in the dishwasher?"],
      ["Am I the only one around here", "who reads the whole email?"],
      ["Am I the only one around here", "who replaces the toilet paper?"],
      ["Am I the only one around here", "who mutes their mic?"],
      ["Am I the only one around here", "who returns shopping carts?"],
    ],
  },
  {
    names: ["Sparta Leonidas", "This Is Sparta"],
    c: [
      ["Monday?", "This is Sparta!"],
      ["Is it the weekend yet?", "This is Sparta!"],
      ["Five more minutes?", "This is Sparta!"],
      ["Leg day already?", "This is Sparta!"],
      ["Another meeting?", "This is Sparta!"],
    ],
  },
  {
    names: ["Third World Success Kid"],
    c: [
      ["Found wifi", "without a password"],
      ["Charger reaches", "the bed"],
      ["Remembered my password", "on the first try"],
      ["Dropped my phone", "screen still fine"],
      ["Microwave stopped", "at exactly 0:01"],
    ],
  },
  {
    names: ["Ermahgerd", "Ermahgerd Girl"],
    c: [
      ["Ermahgerd", "perzza"],
      ["Ermahgerd", "werkend"],
      ["Ermahgerd", "merms"],
      ["Ermahgerd", "berks"],
      ["Ermahgerd", "derg"],
    ],
  },
];
