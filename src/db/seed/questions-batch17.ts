// questions-batch17.ts
// Core 1 — Two supplemental topics added post-release:
//   topic-c1-5-0: Troubleshooting Methodology (CompTIA 6-step process)
//   topic-c1-1-4: Mobile Device Display Components

const NOW = new Date().toISOString()

type Choice = { id: string; text: string; isCorrect: boolean }

function ch(a: string, b: string, c: string, d: string, correct: 'a' | 'b' | 'c' | 'd'): string {
  return JSON.stringify([
    { id: 'a', text: a, isCorrect: correct === 'a' },
    { id: 'b', text: b, isCorrect: correct === 'b' },
    { id: 'c', text: c, isCorrect: correct === 'c' },
    { id: 'd', text: d, isCorrect: correct === 'd' },
  ] as Choice[])
}

const ca = (id: 'a' | 'b' | 'c' | 'd') => JSON.stringify(id)

export const BATCH17_QUESTIONS = [

  // ─── topic-c1-5-0: Troubleshooting Methodology ───────────────────────────

  {
    id: 'q-c1-5-0-01',
    topicId: 'topic-c1-5-0',
    type: 'single_choice' as const,
    stem: 'A user reports that their computer will not connect to the internet. According to CompTIA\'s troubleshooting methodology, what should the technician do FIRST?',
    choices: ch(
      'Replace the network adapter with a known-good spare',
      'Ask the user questions to gather more information about the problem',
      'Run ipconfig /release and /renew to refresh the IP address',
      'Check the event log for network-related errors',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Step 1 of the CompTIA 6-step troubleshooting methodology is "Identify the problem." This involves gathering information by questioning the user, asking what changed recently, and attempting to reproduce the issue. You do not form a theory or take action until you have collected enough information.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-5-0-02',
    topicId: 'topic-c1-5-0',
    type: 'single_choice' as const,
    stem: 'A technician has identified the problem and tested a theory that was confirmed. What is the NEXT step in the CompTIA troubleshooting methodology?',
    choices: ch(
      'Document findings and outcomes',
      'Verify full system functionality',
      'Establish a plan of action and implement the solution',
      'Establish a new theory of probable cause',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'The 6 steps in order are: (1) Identify, (2) Establish theory, (3) Test theory, (4) Establish plan and implement, (5) Verify, (6) Document. After confirming the theory in Step 3, the next step is Step 4: establish a plan of action and implement the fix.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-5-0-03',
    topicId: 'topic-c1-5-0',
    type: 'single_choice' as const,
    stem: 'Which step of the CompTIA troubleshooting methodology is ALWAYS performed last?',
    choices: ch(
      'Verify full system functionality',
      'Implement preventive measures',
      'Document findings, actions, and outcomes',
      'Escalate the ticket to a senior technician',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'Documentation (Step 6) is always the final step — it comes after verification. Never document before confirming the fix works. Documentation creates the knowledge base for future technicians and provides an audit trail for compliance.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-5-0-04',
    topicId: 'topic-c1-5-0',
    type: 'single_choice' as const,
    stem: 'A technician replaces a faulty NIC and the network connectivity is restored. Before closing the ticket, the technician discovers that the onboard audio is now not working. Which troubleshooting step was SKIPPED?',
    choices: ch(
      'Establish a theory of probable cause',
      'Test the theory to determine the cause',
      'Establish a plan of action',
      'Verify full system functionality',
      'd'
    ),
    correctAnswer: ca('d'),
    explanation: 'Step 5 is "Verify full system functionality." This step requires confirming not only that the original problem is resolved, but also that no new problem was introduced by the repair. Discovering the audio failure during Step 5 would have prompted investigation before closing the ticket.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-5-0-05',
    topicId: 'topic-c1-5-0',
    type: 'single_choice' as const,
    stem: 'When testing a theory, a technician changes the power cable, the data cable, AND the hard drive simultaneously — but the system still does not boot. What fundamental troubleshooting principle did the technician violate?',
    choices: ch(
      'The technician should have escalated before testing',
      'Only one variable should be changed at a time when testing',
      'The technician skipped documenting before testing',
      'The theory should have been established before testing',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'When testing a theory (Step 3), change only one variable at a time. If multiple components are changed simultaneously and the problem persists or is resolved, you cannot identify which change caused the outcome. This makes it impossible to determine the actual root cause.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-5-0-06',
    topicId: 'topic-c1-5-0',
    type: 'single_choice' as const,
    stem: 'A technician has exhausted multiple theories and cannot identify the root cause of a server performance issue. According to the CompTIA troubleshooting methodology, what should happen NEXT?',
    choices: ch(
      'Document the problem and close the ticket',
      'Re-image the server operating system',
      'Escalate the problem to a more experienced technician or specialist',
      'Move directly to implementing a plan of action',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'Escalation is appropriate during Step 3 (test the theory) when all reasonable theories have been eliminated without a confirmed root cause. Always document what you\'ve already tried before escalating so the next technician does not repeat your steps.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-5-0-07',
    topicId: 'topic-c1-5-0',
    type: 'single_choice' as const,
    stem: 'During the "Identify the Problem" step, a technician notices that five users in the same department are all reporting the same network issue starting this morning. What does this observation MOST directly help determine?',
    choices: ch(
      'The root cause of the failure',
      'The scope of the problem',
      'The theory of probable cause',
      'The plan of action',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Asking whether others are experiencing the same issue and checking the scope of the problem is a key action in Step 1 (Identify the problem). Knowing the problem affects multiple users in one department suggests a shared resource (switch, router, VLAN, or server) rather than an individual workstation issue.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-5-0-08',
    topicId: 'topic-c1-5-0',
    type: 'single_choice' as const,
    stem: 'A technician is about to reinstall Windows on a user\'s laptop to resolve a persistent software issue. Before implementing this plan, what should the technician do FIRST?',
    choices: ch(
      'Document the current system configuration',
      'Verify full system functionality',
      'Back up the user\'s data',
      'Establish a new theory of probable cause',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'Step 4 (Establish a plan of action and implement) includes determining whether a backup is needed before proceeding with a destructive change like an OS reinstall. Backing up user data must happen before re-imaging to prevent data loss.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-5-0-09',
    topicId: 'topic-c1-5-0',
    type: 'single_choice' as const,
    stem: 'What is the correct order of the CompTIA 6-step troubleshooting methodology?',
    choices: ch(
      'Identify → Test → Theory → Plan → Verify → Document',
      'Theory → Identify → Test → Plan → Document → Verify',
      'Identify → Theory → Test → Plan → Verify → Document',
      'Identify → Theory → Plan → Test → Verify → Document',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'The exact CompTIA order is: (1) Identify the problem, (2) Establish a theory of probable cause, (3) Test the theory, (4) Establish a plan of action and implement, (5) Verify full system functionality, (6) Document findings. A helpful mnemonic: "I Take The Problem Very Directly."',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-5-0-10',
    topicId: 'topic-c1-5-0',
    type: 'single_choice' as const,
    stem: 'When establishing a theory of probable cause (Step 2), what approach should a technician use to narrow down possibilities MOST efficiently?',
    choices: ch(
      'Start with the most expensive component and work down',
      'Start with the most obvious and likely causes first',
      'Replace all suspected components simultaneously',
      'Consult management before forming any hypothesis',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Step 2 says to list possible causes ordered by likelihood and consider simple things first — cable unplugged, power off, user error. This "question the obvious" approach saves time by ruling out easy causes before moving to complex diagnostics.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-5-0-11',
    topicId: 'topic-c1-5-0',
    type: 'single_choice' as const,
    stem: 'A technician fixes a laser printer jam and tests that documents print successfully. What additional action is REQUIRED before completing Step 5 of the troubleshooting process?',
    choices: ch(
      'Document the fix in the ticketing system',
      'Verify that all other printer functions (such as scanning) still work correctly',
      'Re-image the print server to prevent recurrence',
      'Establish a new theory in case the jam returns',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Step 5 (Verify full system functionality) requires confirming the fix AND checking that nothing else broke. On a multifunction device, fixing the jam must be followed by verifying that scanning, copying, and faxing still work — a repair that breaks another function is not complete.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-5-0-12',
    topicId: 'topic-c1-5-0',
    type: 'single_choice' as const,
    stem: 'Which of the following is included in Step 5 (Verify Full System Functionality) but NOT in Step 4 (Establish a Plan of Action)?',
    choices: ch(
      'Determining whether a rollback plan is needed',
      'Implementing preventive measures such as applying OS updates',
      'Getting approval from change management',
      'Backing up data before making changes',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Step 5 includes implementing preventive measures: applying OS/firmware updates, updating antivirus definitions, educating the user, and making permanent configuration changes. These actions prevent recurrence. Backup, rollback planning, and approvals are part of Step 4.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },

  // ─── topic-c1-1-4: Mobile Device Display Components ──────────────────────

  {
    id: 'q-c1-1-4-01',
    topicId: 'topic-c1-1-4',
    type: 'single_choice' as const,
    stem: 'A technician is troubleshooting a smartphone where the screen displays a normal image but touch input is completely unresponsive. Which component is MOST likely faulty?',
    choices: ch(
      'LCD panel',
      'Backlight inverter',
      'Digitizer',
      'OLED driver board',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'The digitizer is the layer that detects touch input and converts physical contact into digital coordinates. If the image is fine but touch does not work, the LCD/OLED panel is functioning correctly — only the digitizer (or its connection) has failed. These are separate layers in the display stack.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-1-4-02',
    topicId: 'topic-c1-1-4',
    type: 'single_choice' as const,
    stem: 'A user complains that their phone\'s screen is completely dark and unresponsive to touch. A technician holds a flashlight close to the screen and can faintly see the home screen. What has MOST likely failed?',
    choices: ch(
      'Digitizer',
      'LCD backlight',
      'OLED panel',
      'Proximity sensor',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'When a backlight fails on an LCD device, the LCD panel continues to produce an image — but with no illumination from behind, it is invisible under normal conditions. A flashlight held close will reveal the faint image by providing external light through the panel. This is a classic symptom of LCD backlight failure.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-1-4-03',
    topicId: 'topic-c1-1-4',
    type: 'single_choice' as const,
    stem: 'Which display technology produces its own light and does NOT require a separate backlight?',
    choices: ch(
      'IPS LCD',
      'TN LCD',
      'VA LCD',
      'OLED',
      'd'
    ),
    correctAnswer: ca('d'),
    explanation: 'OLED (Organic Light-Emitting Diode) pixels produce their own light individually — each pixel turns on and off independently. No backlight is needed, which allows true blacks (fully off pixels), a thinner panel, and lower power consumption when displaying dark content. All LCD variants require a backlight.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-1-4-04',
    topicId: 'topic-c1-1-4',
    type: 'single_choice' as const,
    stem: 'A user reports seeing a permanent ghost image of the navigation bar on their smartphone screen, even when displaying a white background. What is the MOST likely cause?',
    choices: ch(
      'LCD backlight degradation',
      'Digitizer calibration error',
      'OLED burn-in',
      'Cracked protective glass',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'OLED burn-in occurs when a static image — such as a navigation bar, status bar, or always-on element — is displayed for an extended period. The organic materials degrade unevenly, permanently etching a ghost of the image into the display. This is a known disadvantage of OLED technology versus LCD.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-1-4-05',
    topicId: 'topic-c1-1-4',
    type: 'single_choice' as const,
    stem: 'What distinguishes Samsung\'s Super AMOLED displays from standard AMOLED displays?',
    choices: ch(
      'Super AMOLED uses a separate backlight layer for brighter output',
      'Super AMOLED integrates the digitizer directly into the display panel',
      'Super AMOLED supports resistive touch instead of capacitive',
      'Super AMOLED uses LCD technology instead of OLED',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Super AMOLED integrates the digitizer layer directly into the OLED display panel rather than layering it on top. This eliminates a separate touch layer, making the display thinner, lighter, and improving outdoor visibility because there is no air gap between the digitizer and panel to cause internal reflections.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-1-4-06',
    topicId: 'topic-c1-1-4',
    type: 'single_choice' as const,
    stem: 'A field technician wearing thick rubber gloves cannot operate a tablet touchscreen. Which digitizer technology does the tablet MOST likely use, and is this a defect?',
    choices: ch(
      'Resistive digitizer — this is a defect and should be repaired',
      'Capacitive digitizer — this is expected behavior, not a defect',
      'Capacitive digitizer — this is a defect caused by moisture damage',
      'Resistive digitizer — this is expected behavior, not a defect',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Capacitive digitizers detect the electrical capacitance of a finger or conductive stylus. Non-conductive materials — including rubber gloves, regular styluses, and gloved hands — will not register because they do not conduct electricity. This is expected behavior. Resistive digitizers work with any object but are single-touch only and rarely used in modern tablets.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-1-4-07',
    topicId: 'topic-c1-1-4',
    type: 'single_choice' as const,
    stem: 'Two smartphones both have a 1920×1080 (FHD) display resolution. Phone A has a 5-inch screen; Phone B has a 6.5-inch screen. Which phone will have a sharper-looking display and why?',
    choices: ch(
      'Phone B — larger screens always have higher PPI',
      'Phone A — the same resolution packed into a smaller screen produces higher PPI',
      'They will look identical because they have the same resolution',
      'Phone B — larger screens benefit from subpixel rendering',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'PPI (pixels per inch) measures pixel density. With the same resolution (1920×1080), a smaller screen packs more pixels into each inch, producing a sharper image. Phone A at 5 inches has approximately 441 PPI; Phone B at 6.5 inches has approximately 339 PPI — visibly less sharp at normal viewing distances.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-1-4-08',
    topicId: 'topic-c1-1-4',
    type: 'single_choice' as const,
    stem: 'After replacing a smartphone display assembly, a technician notices that taps register a few millimeters away from where the user actually touched. What is the MOST likely cause?',
    choices: ch(
      'OLED burn-in from the previous display',
      'The replacement panel has a lower resolution than the original',
      'The digitizer cable is incorrectly seated or the digitizer needs calibration',
      'The proximity sensor is interfering with touch input',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'Touch offset — where taps register in the wrong location — is a classic symptom of an incorrectly seated digitizer ribbon cable or a digitizer that requires calibration after replacement. Always verify multi-touch works at all corners of the screen after a display replacement to catch this issue.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-1-4-09',
    topicId: 'topic-c1-1-4',
    type: 'single_choice' as const,
    stem: 'Which sensor is responsible for turning off the smartphone screen during a phone call to prevent accidental touch input from the user\'s cheek?',
    choices: ch(
      'Ambient light sensor',
      'Gyroscope',
      'Proximity sensor',
      'Accelerometer',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'The proximity sensor (typically located in the front bezel) detects when an object — such as the user\'s face — is close to the screen. During a call, it disables the touchscreen to prevent accidental input. The ambient light sensor adjusts screen brightness; the gyroscope detects rotation; the accelerometer detects linear movement.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-1-4-10',
    topicId: 'topic-c1-1-4',
    type: 'single_choice' as const,
    stem: 'Why do under-display optical fingerprint sensors only function on OLED smartphones and NOT on LCD smartphones?',
    choices: ch(
      'LCD screens generate too much heat, degrading the fingerprint sensor',
      'Optical fingerprint sensors use the display\'s own pixel light to illuminate the fingerprint, which only OLED pixels can provide',
      'LCD displays have a digitizer layer that blocks the fingerprint signal',
      'Under-display sensors require True Tone calibration, which is an OLED-exclusive feature',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Under-display optical fingerprint sensors work by illuminating the user\'s finger with light from the display pixels directly above the sensor. OLED pixels produce their own light and can be lit selectively, making this possible. LCD panels require a backlight behind the panel — individual pixels cannot emit targeted light from above the sensor area.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-1-4-11',
    topicId: 'topic-c1-1-4',
    type: 'single_choice' as const,
    stem: 'A customer brings in an iPhone with a cracked screen. The technician replaces the display with an aftermarket INCELL panel. The customer later complains that the screen looks slightly different and the auto-brightness adjustment is inconsistent. What is the MOST likely explanation?',
    choices: ch(
      'The INCELL panel installed is defective and must be replaced',
      'Non-OEM displays may not support True Tone and may trigger color calibration differences',
      'INCELL panels are not compatible with iPhone and the technician made an error',
      'The proximity sensor was damaged during the repair',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'High-quality aftermarket (INCELL) panels are lower cost alternatives but may not support Apple\'s True Tone technology, which adjusts color temperature based on ambient lighting. They may also lack the factory color calibration of OEM panels, resulting in slightly different whites and colors. Customers should be informed before non-OEM parts are used.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  {
    id: 'q-c1-1-4-12',
    topicId: 'topic-c1-1-4',
    type: 'single_choice' as const,
    stem: 'What is the correct top-to-bottom order of layers in a typical modern smartphone display assembly?',
    choices: ch(
      'LCD panel → Digitizer → Protective glass → Backlight → Frame',
      'Protective glass → Digitizer → LCD/OLED panel → Backlight (LCD only) → Frame',
      'Digitizer → Protective glass → Backlight → LCD panel → Frame',
      'Protective glass → LCD panel → Digitizer → Backlight → Frame',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'From top (closest to the user) to bottom: (1) Protective glass such as Gorilla Glass — scratch resistance; (2) Digitizer — touch detection; (3) LCD or OLED panel — image production; (4) Backlight — only present on LCD panels; (5) Frame/chassis — structural support. On most modern phones, layers 1–3 are fused into a single assembly.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

]
