// ─────────────────────────────────────────────
//  Critter Quest — Story Quests Data (Phase 1)
//  Static pre-written adventures. AI generation
//  is Phase 2 via Netlify Functions proxy.
// ─────────────────────────────────────────────

const STORY_QUESTS = {

  // ── Forest ────────────────────────────────────
  forest: {

    kindergarten: [{
      id:      'forest-k-1',
      title:   'The Missing Acorns',
      chapter: 1,
      emoji:   '🌲🐿️🍂',

      wrongNudges: [
        'The forest path blurs... try again!',
        'An acorn bounced away! Take another look.',
        'A squirrel shook her head... check the numbers!',
        'The paw prints lead back... try once more!',
      ],

      correctReactions: [
        'Great find! Bramble cheers! 🐿️✨',
        'Wonderful! The forest glows brighter! 🌲💫',
        'Bramble does a happy spin! 🌀🌰',
        'Yes! The path lights up! ⭐🌲',
        'Amazing! A forest friend applauds! 🍂✨',
      ],

      openingScene: {
        title: 'Chapter 1: The Missing Acorns',
        emoji: '🌲🐿️🍂',
        text:  'Bramble the squirrel woke up and stretched his fluffy tail — then GASPED. His winter stash of 10 precious acorns was gone! Only a trail of tiny paw prints led into the Whispering Wood. Help Bramble follow the clues and solve the mystery before nightfall!',
        btnLabel: 'Begin! 🌲',
      },

      questions: [
        {
          emoji:        '🌰🐿️',
          storyContext: 'Bramble found 3 acorns under the big oak tree. Then he spotted 4 more hiding by the stream.',
          a: 3, op: '+', b: 4, answer: 7,
        },
        {
          emoji:        '👜🍂',
          storyContext: 'A torn leaf pouch had 6 acorns inside, but 2 had tumbled out through a hole.',
          a: 6, op: '-', b: 2, answer: 4,
        },
        {
          emoji:        '🐦🌰',
          storyContext: 'A friendly robin carried 5 acorns to Bramble. He already had 4 clutched in his paws.',
          a: 5, op: '+', b: 4, answer: 9,
        },
        {
          emoji:        '🦋🌲',
          storyContext: 'There were 8 butterflies resting on the mossy trail. Then 3 floated away on the breeze.',
          a: 8, op: '-', b: 3, answer: 5,
        },
        {
          emoji:        '🍄🪵',
          storyContext: 'Bramble spotted 2 mushrooms growing on one log and 6 more on a nearby log.',
          a: 2, op: '+', b: 6, answer: 8,
        },
        {
          emoji:        '🌲🌰',
          storyContext: 'There were 7 pinecones on the trail. Bramble tucked 3 safely into his cheeks.',
          a: 7, op: '-', b: 3, answer: 4,
        },
        {
          emoji:        '🪵🌰',
          storyContext: 'Bramble found 3 acorns on the left side of the hollow log and 5 more on the right side.',
          a: 3, op: '+', b: 5, answer: 8,
        },
        {
          emoji:        '✨🌙',
          storyContext: 'Nine tiny fireflies were lighting the way, but 4 winked out as dawn approached.',
          a: 9, op: '-', b: 4, answer: 5,
        },
        {
          emoji:        '🪨🌰',
          storyContext: 'Behind a mossy rock Bramble found 5 big acorns and 4 small ones all in a pile.',
          a: 5, op: '+', b: 4, answer: 9,
        },
        {
          emoji:        '🌟🌰',
          storyContext: 'The final clue! A hollow stump held 6 golden acorns and 4 small ones — could this be the whole stash?',
          a: 6, op: '+', b: 4, answer: 10,
        },
      ],

      milestones: [
        {
          afterQ:   3,
          emoji:    '🐾🌲',
          title:    'A New Clue!',
          text:     'Bramble counts his finds and spots something — a trail of tiny paw prints leading deeper into the Whispering Wood! He twitches his nose and follows them...',
          btnLabel: 'Follow the trail! 🐾',
        },
        {
          afterQ:   6,
          emoji:    '🪵🔍',
          title:    'The Hollow Log!',
          text:     'The paw prints lead straight to the old hollow log at the heart of the forest. A faint rustling comes from inside... something is in there!',
          btnLabel: 'Look inside! 🔍',
        },
        {
          afterQ:   9,
          emoji:    '✨🌲',
          title:    'So Close!',
          text:     'One last puzzle stands between Bramble and his precious acorns. He takes a deep breath, fluffs his tail for courage, and gets ready...',
          btnLabel: 'Last puzzle! ✨',
        },
      ],

      closingScene: {
        emoji:    '🐿️🌰✨',
        title:    'Mystery Solved!',
        text:     'Bramble squeezed into the hollow log — and there they were! All 10 acorns, safe and snug. The autumn wind had rolled them inside during last night\'s storm. He did three happy spins and thanked you for helping him follow every clue!',
        teaser:   'Next time: Something big and furry stirs deep in the Whispering Wood... 🐻',
        btnLabel: 'Claim Reward! 🌟',
      },
    }],

    grade3: [{
      id:      'forest-g3-1',
      title:   'The Ancient Forest Map',
      chapter: 1,
      emoji:   '🗺️🌲🔑',

      wrongNudges: [
        'The map fades... check your numbers!',
        'The forest guardian shakes her head — try again!',
        'A riddle still unsolved... look more carefully!',
        'The vault lock won\'t budge... one more try!',
      ],

      correctReactions: [
        'The map reveals more! 🗺️✨',
        'Finn marks it confirmed! ✅🌲',
        'The forest guardian nods approvingly! 🌿⭐',
        'Another riddle solved! 🔑💫',
        'Excellent! The vault shimmers! 🏆🪨',
      ],

      openingScene: {
        title:    'Chapter 1: The Ancient Forest Map',
        emoji:    '🗺️🌲🔑',
        text:     'Explorer Finn is deep in the Whispering Wood, clutching a crumbling map etched with strange numbers. Legend says these riddles guard the path to the Mossy Vault — a chamber no one has opened in 300 years. "Only a true mathematician can follow this map," the parchment reads. That\'s you!',
        btnLabel: 'Start exploring! 🗺️',
      },

      questions: [
        {
          emoji:        '🧭🌲',
          storyContext: 'The map shows 124 steps heading north and then 253 steps going east to reach the first waypoint.',
          a: 124, op: '+', b: 253, answer: 377,
        },
        {
          emoji:        '🚪⚙️',
          storyContext: 'The old iron gate is sealed with bolts — 8 bolts across each of its 9 rows.',
          a: 8, op: '×', b: 9, answer: 72,
        },
        {
          emoji:        '🌳🪵',
          storyContext: 'The ancient grove once had 847 trees. Over centuries, 123 have fallen and returned to the earth.',
          a: 847, op: '-', b: 123, answer: 724,
        },
        {
          emoji:        '🪨💧',
          storyContext: 'Stepping stones cross the forest stream in exactly 45 equal steps — 9 stones per column.',
          a: 45, op: '÷', b: 9, answer: 5,
        },
        {
          emoji:        '🏮⏱️',
          storyContext: 'Finn\'s lantern burned for 215 minutes yesterday as he mapped the north trail, and 134 minutes today.',
          a: 215, op: '+', b: 134, answer: 349,
        },
        {
          emoji:        '🏺🌿',
          storyContext: 'The forest guardian\'s ancient shelf holds 6 rows of golden jars, with 7 jars in each row.',
          a: 6, op: '×', b: 7, answer: 42,
        },
        {
          emoji:        '🕯️🗺️',
          storyContext: 'The hidden tunnel is 650 feet long in total. Finn has carefully mapped 320 feet so far.',
          a: 650, op: '-', b: 320, answer: 330,
        },
        {
          emoji:        '💎📦',
          storyContext: 'Finn uncovered 63 shining gems and sorted them equally into 9 crystal boxes for safekeeping.',
          a: 63, op: '÷', b: 9, answer: 7,
        },
        {
          emoji:        '🪙🗝️',
          storyContext: 'Two ancient treasure chests were unlocked — the first held 347 silver coins, the second held 142.',
          a: 347, op: '+', b: 142, answer: 489,
        },
        {
          emoji:        '🔐🌲',
          storyContext: 'The great vault door has 12 rows of ancient symbols with 8 symbols in each row — every one must be matched to open the lock.',
          a: 12, op: '×', b: 8, answer: 96,
        },
      ],

      milestones: [
        {
          afterQ:   3,
          emoji:    '🗺️✨',
          title:    'The Map Glows!',
          text:     'Three riddles cracked! The old parchment shimmers and a new section of the forest path appears in glowing ink. Finn pushes through the ferns ahead...',
          btnLabel: 'Press on! 🗺️',
        },
        {
          afterQ:   6,
          emoji:    '🔑🌲',
          title:    'A Hidden Door!',
          text:     'Deep in the bark of the oldest oak, a door swings open with a low creak. Flickering torchlight pours out. The Mossy Vault is close — so close Finn can smell the ancient stone!',
          btnLabel: 'Enter! 🔑',
        },
        {
          afterQ:   9,
          emoji:    '⚡🪵',
          title:    'Final Lock!',
          text:     'One last mathematical lock guards the Mossy Vault\'s greatest secret. Finn\'s hand trembles as he lifts the lantern to read the final inscription...',
          btnLabel: 'Solve it! ⚡',
        },
      ],

      closingScene: {
        emoji:    '🏆🗺️✨',
        title:    'The Vault is Open!',
        text:     'BOOM — the vault door swings wide. Inside: shelves of emerald gems, ancient scrolls, and walls etched with centuries of mathematical wisdom. Finn opens his journal and writes: "The Mossy Vault — unlocked by a true mathematician." That\'s you!',
        teaser:   'Next time: Deep in the forest, ancient stone guardians begin to stir... 🗿',
        btnLabel: 'Claim Reward! 🏆',
      },
    }],
  },

  // ── Jungle ────────────────────────────────────
  jungle: {

    kindergarten: [{
      id:      'jungle-k-1',
      title:   "Ellie's Lost Herd",
      chapter: 1,
      emoji:   '🌴🐘💛',

      wrongNudges: [
        "Ellie splashes the wrong way... try again!",
        "A parrot squawks NO! — check your answer.",
        "The jungle path winds back... try once more!",
        "A friendly frog shakes its head — look again!",
      ],

      correctReactions: [
        "Ellie trumpets with joy! 🐘💛",
        "The jungle cheers! 🌴✨",
        "A monkey claps! 🐒⭐",
        "Ellie stomps happily! 🐾💫",
        "The river sings! 🌊✨",
      ],

      openingScene: {
        title:    "Chapter 1: Ellie's Lost Herd",
        emoji:    '🌴🐘💛',
        text:     "Baby elephant Ellie woke up alone on the jungle riverbank. Oh no! Her family had crossed the river without noticing she'd stopped to watch the butterflies. Now the big jungle stretches between her and home. Help Ellie follow the jungle path and find her herd!",
        btnLabel: 'Help Ellie! 🌴',
      },

      questions: [
        {
          emoji:        '🐒🌴',
          storyContext: 'Ellie looked up and saw 2 monkeys swinging in the first tree and 5 more monkeys in the next tree.',
          a: 2, op: '+', b: 5, answer: 7,
        },
        {
          emoji:        '🦜🌿',
          storyContext: 'Eight colorful parrots were perched on a branch squawking loudly. Then 3 of them flew away.',
          a: 8, op: '-', b: 3, answer: 5,
        },
        {
          emoji:        '🐊💧',
          storyContext: 'Four crocodiles were sunning on the warm riverbank when 3 more slipped in to join them.',
          a: 4, op: '+', b: 3, answer: 7,
        },
        {
          emoji:        '🌸🌊',
          storyContext: 'Ellie counted 6 beautiful lotus flowers floating on the river. She nudged 2 gently aside with her trunk.',
          a: 6, op: '-', b: 2, answer: 4,
        },
        {
          emoji:        '🐢🌿',
          storyContext: 'Three baby turtles were sitting on a mossy log and 5 more were climbing out of the water.',
          a: 3, op: '+', b: 5, answer: 8,
        },
        {
          emoji:        '✨🌴',
          storyContext: 'Nine fireflies lit up the jungle path ahead. Then 4 darted away into the tall grass.',
          a: 9, op: '-', b: 4, answer: 5,
        },
        {
          emoji:        '🥭🌿',
          storyContext: 'The fruit tree had 5 ripe mangoes on one branch and 4 more on another — perfect for the whole herd!',
          a: 5, op: '+', b: 4, answer: 9,
        },
        {
          emoji:        '🦩💧',
          storyContext: 'Seven graceful flamingos waded in the shallows near Ellie. Then 2 of them took flight.',
          a: 7, op: '-', b: 2, answer: 5,
        },
        {
          emoji:        '🐘🌊',
          storyContext: 'Ellie spotted 3 family members waiting on the left bank and 6 more standing on the right bank.',
          a: 3, op: '+', b: 6, answer: 9,
        },
        {
          emoji:        '🎉🐘',
          storyContext: 'The final count! Ellie saw 6 aunties and 4 cousins — could the whole herd really be here?',
          a: 6, op: '+', b: 4, answer: 10,
        },
      ],

      milestones: [
        {
          afterQ:   3,
          emoji:    '🌴💧',
          title:    'Across the River!',
          text:     'Ellie splashes bravely through the shallow part of the river! The jungle grows thick and green on the other side. She can smell familiar flowers — her herd passed this way!',
          btnLabel: 'Keep going! 🌴',
        },
        {
          afterQ:   6,
          emoji:    '🦋🌿',
          title:    'The Jungle Shortcut!',
          text:     'A family of butterflies flutters around Ellie and leads her down a hidden jungle path — a shortcut! She can hear distant elephant rumbles growing louder...',
          btnLabel: 'Follow them! 🦋',
        },
        {
          afterQ:   9,
          emoji:    '🐘✨',
          title:    'Almost Home!',
          text:     'Ellie can hear her family\'s calls echoing through the trees! One more puzzle and she\'ll burst through the last stretch of jungle to find them...',
          btnLabel: 'One more! 🐘',
        },
      ],

      closingScene: {
        emoji:    '🐘🌴✨',
        title:    'Herd Reunited!',
        text:     '"ELLIE!" trumpeted Mama Elephant as the little elephant burst through the last stretch of jungle. The whole herd rushed over and wrapped her in a giant elephant hug! Ellie told them all about the crocodiles, flamingos, and fireflies — and the friend who helped her count the way home. That\'s you!',
        teaser:   'Next time: Something ancient sleeps beneath the jungle floor... 🏛️',
        btnLabel: 'Claim Reward! 🎉',
      },
    }],

    grade3: [{
      id:      'jungle-g3-1',
      title:   'The Temple of Numbers',
      chapter: 1,
      emoji:   '🏛️🌴🔢',

      wrongNudges: [
        "The temple door doesn't open... check your math!",
        "Ancient symbols rearrange — try again!",
        "A stone guardian blocks the way... one more try!",
        "The torch flickers... look more closely!",
      ],

      correctReactions: [
        "Ancient symbols glow! ✨🏛️",
        "Maya writes it down! 📓⭐",
        "The temple rumbles in approval! 🪨💫",
        "Another seal broken! 🔓🌴",
        "The torch burns brighter! 🔆✨",
      ],

      openingScene: {
        title:    'Chapter 1: The Temple of Numbers',
        emoji:    '🏛️🌴🔢',
        text:     "Explorer Maya's map ends here — deep in the jungle where ancient trees form a towering gateway. The Temple of Numbers hasn't been visited in over 400 years. Stone inscriptions line the entrance: \"Only one who masters numbers may enter.\" Maya adjusts her explorer's hat. That's you two.",
        btnLabel: 'Enter the temple! 🏛️',
      },

      questions: [
        {
          emoji:        '🧭🌿',
          storyContext: "The jungle path forks at a great fig tree. The north route is 236 steps; the east detour through the vines adds 142 more before they meet at the temple entrance.",
          a: 236, op: '+', b: 142, answer: 378,
        },
        {
          emoji:        '🚪🔢',
          storyContext: "The first temple door is sealed with carved symbols — 7 rows of 8 symbols each. Every one must be identified to pass.",
          a: 7, op: '×', b: 8, answer: 56,
        },
        {
          emoji:        '🕯️🗺️',
          storyContext: "The main tunnel stretches 650 feet into the hillside. Maya has mapped 320 feet so far by torchlight.",
          a: 650, op: '-', b: 320, answer: 330,
        },
        {
          emoji:        '🏺💰',
          storyContext: "Maya finds 45 ancient coins arranged carefully in 9 equal offering bowls along the altar.",
          a: 45, op: '÷', b: 9, answer: 5,
        },
        {
          emoji:        '🌟🏛️',
          storyContext: "Chamber A's floor is covered with 184 gold tiles. Chamber B has 213 gold tiles. How many gold tiles span both chambers?",
          a: 184, op: '+', b: 213, answer: 397,
        },
        {
          emoji:        '💚🌿',
          storyContext: "The great vaulted ceiling is inlaid with jade stones — 9 rows of 6 jade stones each, gleaming in the torchlight.",
          a: 9, op: '×', b: 6, answer: 54,
        },
        {
          emoji:        '📜🏛️',
          storyContext: "A stone tablet reads: this temple was completed 720 years ago. The last recorded explorer visited 310 years ago.",
          a: 720, op: '-', b: 310, answer: 410,
        },
        {
          emoji:        '📚🪨',
          storyContext: "Maya discovers 72 ancient scrolls arranged on 8 equal stone shelves along the inner wall.",
          a: 72, op: '÷', b: 8, answer: 9,
        },
        {
          emoji:        '💎🏺',
          storyContext: "Two great urns stand before the inner vault — one yields 125 ruby gems, the other 243.",
          a: 125, op: '+', b: 243, answer: 368,
        },
        {
          emoji:        '🔐🌴',
          storyContext: "The final vault lock has 11 columns of 7 symbols each — the ultimate mathematical code guarding the temple's greatest secret.",
          a: 11, op: '×', b: 7, answer: 77,
        },
      ],

      milestones: [
        {
          afterQ:   3,
          emoji:    '⛩️🌿',
          title:    'The Doors Open!',
          text:     "Three puzzles cracked! With a deep groan the carved temple doors swing apart, and warm torchlight spills into the jungle. Maya steps inside, notebook ready...",
          btnLabel: 'Go deeper! ⛩️',
        },
        {
          afterQ:   6,
          emoji:    '🔆🪨',
          title:    'The Inner Sanctum!',
          text:     "Ancient stone braziers ignite on their own as Maya enters the inner sanctum — the temple recognises a true mathematician! The treasure vault door is just ahead...",
          btnLabel: 'Approach! 🔆',
        },
        {
          afterQ:   9,
          emoji:    '💫🏛️',
          title:    'The Final Lock!',
          text:     "One last mathematical lock guards the temple's greatest secret. Maya steadies her torch and studies the final inscription carved into solid stone...",
          btnLabel: 'Solve it! 💫',
        },
      ],

      closingScene: {
        emoji:    '🏆🌴✨',
        title:    'Temple Unlocked!',
        text:     "BOOM — the vault unseals with a thunderous echo that shakes the jungle canopy outside. Inside: thousands of ruby gems, jade artifacts, and every wall covered floor-to-ceiling in ancient mathematical wisdom. Maya opens her journal and writes: \"The Temple of Numbers — unlocked by a true mathematician.\" That's you!",
        teaser:   'Next time: A hidden river beneath the temple leads to an even older mystery... 🐊',
        btnLabel: 'Claim Reward! 🏆',
      },
    }],
  },
};
