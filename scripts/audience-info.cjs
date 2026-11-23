// Copy for the /work-memes/ pages, keyed by the audience keys used in `a` in js/captions.js.
// filter: the MEME_AUDIENCES id the "Make this meme" links preselect in the editor.
// intro: opening paragraphs. tips: how to make the meme land. faq: page-specific questions.
module.exports = {
  dev: {
    slug: 'developer-memes',
    filter: 'dev',
    name: 'Developer memes',
    title: 'Developer Memes: Programming Meme Templates and Captions',
    description: 'Free developer meme generator with programming captions about bugs, deploys, code reviews and legacy code. Pick a template, edit the text and share it on Slack or LinkedIn.',
    intro: [
      'Every developer knows the feeling: the code works and nobody knows why, the bug only shows up during the demo, and the "quick fix" takes the whole afternoon. These developer memes turn those moments into something your team can laugh about.',
      'Each template below comes with programming captions written for it. Click "Make this meme" to open it in the editor with the Developers ideas already selected, tweak the words to fit your stack, and download it or copy it straight into Slack, Teams or a pull request comment.',
    ],
    tips: 'The best programming memes are specific. Swap in your own framework, tool or ticket number, keep the joke about the situation rather than a teammate, and post it in the channel where everyone lived through the same incident.',
    faq: [
      { q: 'What makes a good developer meme?', a: 'A shared pain point everyone on the team recognises: flaky tests, Friday deploys, legacy code, endless meetings or a code review that says "LGTM" after four seconds. Keep it about the situation, not a person.' },
      { q: 'Can I post these memes in Slack or on LinkedIn?', a: 'Yes. Download the meme as a PNG or use Copy to paste it straight into Slack, Teams, Discord or a LinkedIn post. There is no watermark.' },
      { q: 'Which templates work best for programming memes?', a: 'Drake Hotline Bling, This Is Fine, Gru\'s Plan, Expanding Brain and Who Would Win? are favourites because they map neatly onto choices, plans that go wrong and tiny bugs that beat big systems.' },
    ],
  },
  product: {
    slug: 'product-manager-memes',
    filter: 'product',
    name: 'Product manager memes',
    title: 'Product Manager Memes: Roadmap, Backlog and Stakeholder Captions',
    description: 'Free product manager meme generator with captions about roadmaps, feature requests, MVPs and stakeholders. Edit a template and share it with your product team.',
    intro: [
      'Product management is the art of saying no politely, writing specs nobody reads, and explaining for the ninth time that the MVP really is supposed to be minimal. These product manager memes are for everyone who has ever owned a backlog.',
      'Pick a template below to see captions written for product people. "Make this meme" opens the editor with the Product management ideas selected, so you can adjust the words for your own roadmap and share the result with your team.',
    ],
    tips: 'Product memes land best when they poke fun at the process: the shiny feature that jumps the queue, the roadmap with no dates, the customer who describes a solution instead of a problem. They make great icebreakers for retros and all hands slides.',
    faq: [
      { q: 'What are product manager memes about?', a: 'Roadmaps, backlogs, feature requests, stakeholders, user research, A/B tests and launches. In short, the daily balancing act between what users need and what everyone else asks for.' },
      { q: 'Can I use these memes in a presentation?', a: 'Yes. Download the meme as a PNG and drop it into your slides, a retro board or a team update. MemeLink is free and adds no watermark.' },
      { q: 'Are there memes for project managers too?', a: 'Yes. See the project manager memes page for captions about deadlines, status reports and scope creep. In the editor, pick the Project management filter for those.' },
    ],
  },
  project: {
    slug: 'project-manager-memes',
    filter: 'project',
    name: 'Project manager memes',
    title: 'Project Manager Memes: Deadline, Scope Creep and Status Report Captions',
    description: 'Free project manager meme generator with captions about deadlines, scope creep, status updates and Gantt charts. Edit a template and share it with your team.',
    intro: [
      'Green status, red reality. Tasks that have been 90% done for six weeks. A "small" change that moves the whole timeline. If you keep projects on track for a living, these project manager memes will feel very familiar.',
      'Every template below has captions written for project managers, scrum masters and delivery leads. "Make this meme" opens it in the editor with the Project management ideas selected, ready to tweak and share.',
    ],
    tips: 'A well-timed meme can make a status update or a retro far more memorable. Keep it light, aim it at the process (scope creep, shifting deadlines, missing updates) and never at a specific colleague or client.',
    faq: [
      { q: 'What are project manager memes about?', a: 'Deadlines, scope creep, status reports, risk registers, stand-ups, dependencies and the eternal question of who owns the action item.' },
      { q: 'Is it OK to share these memes at work?', a: 'The captions here are written to be work-safe and to joke about situations, not people. As always, you know your team best, so adjust the words to fit.' },
      { q: 'How do I make my own project manager meme?', a: 'Pick a template, click "Make this meme", then click any text on the image to change it. When you are happy, click Download PNG or Copy.' },
    ],
  },
  office: {
    slug: 'office-memes',
    filter: 'linkedin',
    name: 'Office memes',
    title: 'Office Memes: Meeting, Email and Remote Work Captions',
    description: 'Free office meme generator with captions about meetings, emails, video calls and office life. Make a work meme in seconds and share it with your coworkers.',
    intro: [
      'The meeting that could have been an email. Reply all. Forgetting to unmute. "Per my last email." Office life is full of small, shared absurdities, and these office memes capture them for everyone from the open plan office to the home desk.',
      'Each template below comes with work captions written for it. "Make this meme" opens the editor with the LinkedIn ideas selected, so you can make a meme for the team chat or your feed in a few seconds.',
    ],
    tips: 'Office memes work because everyone has been there. Pick a moment the whole team recognises, keep it friendly, and post it where it fits: the random channel, a Friday team update or your LinkedIn feed.',
    faq: [
      { q: 'What are the most relatable office memes?', a: 'Meetings that could have been emails, reply-all chains, video call mishaps, the 4:59pm "got a minute?" and free food in the kitchen. They work in any team and any industry.' },
      { q: 'Are these memes safe to share with coworkers?', a: 'Yes. The captions are written to be work-safe and to laugh at situations rather than people, so they fit a team chat or a LinkedIn post.' },
      { q: 'Can I add my own picture instead of a template?', a: 'Yes. Open the Upload picture tab in the editor and choose a photo. It stays on your device and is never uploaded to our servers.' },
    ],
  },
  parents: {
    slug: 'parenting-memes',
    filter: 'parents',
    name: 'Parenting memes',
    title: 'Parenting Memes: Funny Captions for Working Parents',
    description: 'Free parenting meme generator with captions for working parents about toddlers, bedtime, school runs and video calls. Edit a template and share it.',
    intro: [
      'Cold coffee, a toddler announcing their snack to a video call, and bedtime that somehow takes longer than the workday. These parenting memes are for working parents juggling meetings, school runs and tiny people with very strong opinions about socks.',
      'Each template below comes with family-friendly captions written for it. "Make this meme" opens the editor with the Parenting ideas selected, so you can tweak the words to match your own household and share it with the group chat.',
    ],
    tips: 'The funniest parenting memes are true. Change the details to match your kids, keep it kind (to them and to yourself), and share it with the people who will get it: the parents channel at work, your friends or your family group chat.',
    faq: [
      { q: 'What are parenting memes about?', a: 'Sleep, or the lack of it, picky eaters, bedtime, school projects, toddlers on work calls and the rare joy of finishing a hot drink.' },
      { q: 'Are these memes family friendly?', a: 'Yes. The captions are written to be family friendly and work-safe, so you can share them with other parents, at work or with your relatives.' },
      { q: 'Can I make a meme with a photo of my own kids?', a: 'Yes. Use the Upload picture tab in the editor. Your photo is edited on your device and never sent to our servers.' },
    ],
  },
};
