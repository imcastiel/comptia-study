// CompTIA A+ 220-1201 practice questions — Core 1 Domain 1 + Domain 2
// 96 questions across 12 topics (8 per topic)

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

function chMulti(
  a: string, b: string, c: string, d: string,
  correct: Array<'a' | 'b' | 'c' | 'd'>
): string {
  const ids = new Set(correct)
  return JSON.stringify([
    { id: 'a', text: a, isCorrect: ids.has('a') },
    { id: 'b', text: b, isCorrect: ids.has('b') },
    { id: 'c', text: c, isCorrect: ids.has('c') },
    { id: 'd', text: d, isCorrect: ids.has('d') },
  ] as Choice[])
}

const ca = (id: 'a' | 'b' | 'c' | 'd') => JSON.stringify(id)
const cam = (...ids: Array<'a' | 'b' | 'c' | 'd'>) => JSON.stringify(ids)

export const BATCH1_QUESTIONS = [

  // ─── 1.1 Mobile Device Hardware (8 questions) ────────────────────────────

  {
    id: 'q-c1-1-1-01',
    topicId: 'topic-c1-1-1',
    type: 'single_choice',
    stem: 'A laptop screen appears completely dark, but when you hold a flashlight close to the display you can faintly see the desktop image. Which component has most likely failed?',
    choices: ch(
      'The LCD panel itself',
      'The eDP cable running through the hinge',
      'The inverter board',
      'The GPU on the motherboard'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'Seeing a faint image under direct light while the backlight appears off is the classic symptom of a failed inverter board. The inverter converts DC power to the high-voltage AC required by a CCFL backlight. If the LCD panel itself failed, there would be no image at all. An eDP cable failure typically causes flickering or color artifacts rather than a completely dark screen. A GPU failure would produce no signal to the display at all.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-1-02',
    topicId: 'topic-c1-1-1',
    type: 'single_choice',
    stem: 'Which internal display interface replaced LVDS on modern laptops and is based on the DisplayPort protocol?',
    choices: ch(
      'HDMI ARC',
      'eDP (Embedded DisplayPort)',
      'VGA analog bus',
      'DVI-D dual link'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'eDP (Embedded DisplayPort) replaced LVDS as the standard internal display interface around 2012. It is based on the DisplayPort protocol, uses a thinner cable with fewer pins, and supports higher resolutions and refresh rates than LVDS. HDMI ARC is an external audio return channel feature. VGA and DVI are external interfaces not used internally in modern laptops.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-1-03',
    topicId: 'topic-c1-1-1',
    type: 'single_choice',
    stem: 'A touchscreen laptop responds normally to keyboard and mouse input, but touch and stylus gestures are completely ignored. The display image is perfect. Which component should be replaced?',
    choices: ch(
      'The LCD panel',
      'The digitizer',
      'The GPU driver',
      'The eDP ribbon cable'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'The digitizer is the layer that converts touch and stylus input into digital coordinates. When the display image is fine but all touch input fails, the digitizer has failed — not the LCD. The LCD panel produces the image; its failure would cause display problems, not input problems. A GPU driver issue would affect display rendering. An eDP cable failure would cause visual artifacts, not loss of touch.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-1-04',
    topicId: 'topic-c1-1-1',
    type: 'single_choice',
    stem: 'You are upgrading a laptop from DDR4 to DDR5 RAM. The new DDR5 SO-DIMM physically will not seat in the slot. What is the most likely reason?',
    choices: ch(
      'The DDR5 module has 260 pins and the slot supports only 204',
      'DDR5 SO-DIMMs have 262 pins while DDR4 SO-DIMMs have 260 pins and a different notch position',
      'The laptop BIOS must be updated before DDR5 can be physically installed',
      'DDR5 requires a different voltage regulator module'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'DDR4 SO-DIMMs have 260 pins, while DDR5 SO-DIMMs have 262 pins with a different notch position. The physical incompatibility prevents accidental installation of the wrong generation. DDR3 SO-DIMMs have 204 pins. The BIOS update concern is real but secondary — the physical connector mismatch would prevent seating before any firmware issue matters.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-1-05',
    topicId: 'topic-c1-1-1',
    type: 'single_choice',
    stem: 'Which M.2 SSD form factor designation indicates a drive that is 22 mm wide and 80 mm long?',
    choices: ch(
      '2242',
      '2260',
      '2280',
      '2230'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'M.2 size codes are expressed as width × length in millimeters. The "22" prefix means 22 mm wide — all standard M.2 drives are this width. The second two digits are the length: 2280 = 80 mm long, 2260 = 60 mm, 2242 = 42 mm, 2230 = 30 mm. The 2280 is the most common size found in laptops.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-1-06',
    topicId: 'topic-c1-1-1',
    type: 'single_choice',
    stem: 'A smartphone screen does not respond to a regular plastic stylus, but works fine with a finger. What type of touchscreen technology does the phone use?',
    choices: ch(
      'Resistive — requires physical pressure which the hard plastic stylus does not provide',
      'Capacitive — requires electrical conductivity which a standard stylus lacks',
      'Active digitizer — only works with pressure-sensitive Wacom pens',
      'Infrared — the stylus is blocking the IR beam incorrectly'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Capacitive touchscreens detect the electrical charge conducted by a human finger. A regular plastic stylus has no conductive properties, so it produces no response. An active (capacitive) stylus generates its own electrical field to simulate a finger. Resistive screens detect physical pressure and would work with any object — they do not require conductivity. Infrared screens use light beams and are uncommon in smartphones.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-1-07',
    topicId: 'topic-c1-1-1',
    type: 'single_choice',
    stem: 'Which sensor in a smartphone is responsible for detecting the device\'s rotational orientation precisely enough to support augmented reality apps and in-game gyroscopic controls?',
    choices: ch(
      'Accelerometer',
      'Magnetometer',
      'Barometer',
      'Gyroscope'
    , 'd'),
    correctAnswer: ca('d'),
    explanation: 'The gyroscope measures rotational rate (angular velocity), enabling precise tracking of how fast and in which direction the device is rotating. This is critical for AR and gaming. The accelerometer detects linear acceleration and gravity (useful for screen rotation and step counting) but is not precise enough for rotational tracking on its own. The magnetometer detects magnetic field direction (compass). The barometer measures atmospheric pressure.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-1-08',
    topicId: 'topic-c1-1-1',
    type: 'single_choice',
    stem: 'When replacing a laptop keyboard, which type of connector secures the ribbon cable to the motherboard, and what is the correct procedure to disconnect it?',
    choices: ch(
      'PCIe x1 connector — pull straight out with a spudger',
      'ZIF (Zero Insertion Force) connector — flip the locking tab up before pulling the cable',
      'SATA power connector — squeeze the clip and pull straight back',
      'Molex connector — grip the connector body, not the cable, and pull firmly'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Laptop ribbon cables use ZIF (Zero Insertion Force) connectors. The correct procedure is to flip or slide the locking tab to the open/unlocked position before gently pulling the cable straight out. Forcing the cable without unlocking the ZIF tab destroys the connector permanently. PCIe, SATA, and Molex connectors are not used for keyboard ribbon cables.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  // ─── 1.2 Mobile Accessories & Connectivity (8 questions) ─────────────────

  {
    id: 'q-c1-1-2-01',
    topicId: 'topic-c1-1-2',
    type: 'single_choice',
    stem: 'A technician needs to connect a laptop to a docking station that adds DisplayPort outputs, Gigabit Ethernet, and additional USB ports — capabilities the laptop does not have on its own. What type of device is this?',
    choices: ch(
      'Port replicator',
      'KVM switch',
      'Docking station',
      'USB hub'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'A docking station actively extends the laptop\'s capabilities by adding new ports and functions not present on the laptop (additional display outputs, Ethernet, etc.). A port replicator simply mirrors the laptop\'s existing ports in a convenient tabletop form without adding new functionality. A KVM switch shares peripherals between multiple computers. A USB hub adds USB ports only, not Ethernet or display.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-2-02',
    topicId: 'topic-c1-1-2',
    type: 'single_choice',
    stem: 'You see a USB-C port on a laptop. Without additional markings or documentation, which of the following can you conclusively determine about that port?',
    choices: ch(
      'It supports USB 3.2 Gen 2 speeds (10 Gbps)',
      'It supports Thunderbolt 3',
      'It has an oval, reversible connector shape',
      'It can deliver 100W of power delivery'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'USB-C refers exclusively to the physical connector shape — oval and reversible. The speed, Thunderbolt support, and power delivery capability all depend on the underlying controller, which varies by manufacturer and model. A USB-C port could be USB 2.0 (480 Mbps), USB 3.2, USB4, or Thunderbolt 3/4. The Thunderbolt lightning bolt icon or SS+ marking must be present to confirm higher capabilities.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-2-03',
    topicId: 'topic-c1-1-2',
    type: 'single_choice',
    stem: 'Which Thunderbolt version introduced the USB-C connector, offers 40 Gbps bandwidth, and can simultaneously drive two 4K displays?',
    choices: ch(
      'Thunderbolt 1',
      'Thunderbolt 2',
      'Thunderbolt 3',
      'Thunderbolt 4'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'Thunderbolt 3 introduced the USB-C connector form factor and delivers 40 Gbps bandwidth, along with support for two 4K displays or one 5K display. Thunderbolt 1 and 2 used the Mini DisplayPort connector and offered 10 Gbps and 20 Gbps respectively. Thunderbolt 4 also uses USB-C at 40 Gbps but adds stricter requirements including a minimum of 32 Gbps PCIe bandwidth.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-2-04',
    topicId: 'topic-c1-1-2',
    type: 'single_choice',
    stem: 'A user wants to connect a legacy VGA projector to a laptop that only has DVI output. Which DVI variant supports a passive adapter to VGA?',
    choices: ch(
      'DVI-D single link — digital only',
      'DVI-D dual link — higher resolution digital',
      'DVI-I — carries both analog and digital signals',
      'DVI-A — analog only, not compatible'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'DVI-I (Integrated) carries both digital and analog signals. The four extra pins in a cross pattern around the flat blade are the analog pins, enabling a passive DVI-to-VGA adapter. DVI-D is digital only — its connector physically lacks those analog pins, so a passive VGA adapter cannot work. DVI-A is analog only and is extremely rare.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-2-05',
    topicId: 'topic-c1-1-2',
    type: 'single_choice',
    stem: 'An Android user connects their phone to a Windows PC via USB but the computer does not show the phone as a storage device. What setting must be changed on the phone?',
    choices: ch(
      'Enable USB debugging in Developer Options',
      'Change the USB mode from "Charging only" to "File Transfer (MTP)"',
      'Enable hotspot and tethering in network settings',
      'Disable the screen lock before connecting'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'When an Android phone is connected via USB, it defaults to charging mode. To access files, the user must swipe down the notification shade, tap the USB connection notification, and select File Transfer (MTP — Media Transfer Protocol). MTP gives the PC full file system access. USB debugging is for Android development tools. Hotspot shares the cellular connection, not storage. Screen lock does not block USB file access.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-2-06',
    topicId: 'topic-c1-1-2',
    type: 'single_choice',
    stem: 'A user\'s Bluetooth headphones connected to their phone produce audio that sounds like a phone call rather than stereo music. Which Bluetooth profile is most likely active instead of the correct one?',
    choices: ch(
      'HID (Human Interface Device Profile)',
      'OPP (Object Push Profile)',
      'HFP (Hands-Free Profile) instead of A2DP',
      'PAN (Personal Area Network)'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'A2DP (Advanced Audio Distribution Profile) carries full stereo audio to headphones. HFP (Hands-Free Profile) is used for phone calls and provides narrow-band mono audio — it sounds like a phone call. When both profiles are active and the microphone is being used, the phone can switch to HFP, dropping audio quality. Disabling microphone access or the HFP connection restores A2DP stereo. HID is for keyboards/mice, OPP for file transfer, PAN for internet sharing.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-2-07',
    topicId: 'topic-c1-1-2',
    type: 'single_choice',
    stem: 'Which cloud storage service provides 15 GB of free storage and is the primary sync solution for Android devices using Google accounts?',
    choices: ch(
      'iCloud — 5 GB free, Apple ecosystem',
      'OneDrive — 5 GB free, Microsoft integration',
      'Google Drive — 15 GB free, Android/Google Workspace',
      'Dropbox — 2 GB free, cross-platform'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'Google Drive provides 15 GB of free storage shared across Gmail, Google Photos, and Drive. It is the primary cloud sync solution for Android devices. iCloud gives 5 GB free and is focused on Apple devices. OneDrive gives 5 GB free and integrates with Windows and Microsoft 365. Dropbox provides only 2 GB free but is excellent for cross-platform file sharing.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-2-08',
    topicId: 'topic-c1-1-2',
    type: 'single_choice',
    stem: 'A user\'s iPhone will not sync its contacts to iCloud even though iCloud sync is enabled. Which of the following should be checked FIRST?',
    choices: ch(
      'Whether the USB cable supports data transfer',
      'Whether the iCloud storage quota is full',
      'Whether iTunes is installed on the user\'s PC',
      'Whether cellular data is enabled for iCloud'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'The most common cause of iCloud sync failure is a full storage quota. iCloud provides only 5 GB free, and photos, backups, and documents quickly fill it. When storage is full, sync stops. This should be checked first. A USB cable is not needed for iCloud wireless sync. iTunes is not required for iCloud sync on macOS Catalina+ (Finder handles it). Cellular data for iCloud can be disabled, but the symptom is usually sync working on Wi-Fi but not cellular — not a total sync failure.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  // ─── 1.3 Mobile Network Connectivity (8 questions) ───────────────────────

  {
    id: 'q-c1-1-3-01',
    topicId: 'topic-c1-1-3',
    type: 'single_choice',
    stem: 'What is the smallest physical SIM card form factor used in current smartphones?',
    choices: ch(
      'Micro-SIM (3FF)',
      'Mini-SIM (2FF)',
      'Nano-SIM (4FF)',
      'eSIM (5FF)'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'Nano-SIM (4FF) at approximately 12.3 mm × 8.8 mm is the smallest physical SIM card form factor and is used in all current flagship smartphones (iPhone 5 and later, modern Android). eSIM is not a physical card at all — it is an embedded chip, so it has no physical SIM form factor to compare. Micro-SIM (3FF) was common in mid-2010s phones. Mini-SIM (2FF) is the traditional full-size SIM.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-3-02',
    topicId: 'topic-c1-1-3',
    type: 'single_choice',
    stem: 'An enterprise IT administrator wants all traffic from corporate mobile devices to pass through the company VPN at all times, with no way for users to disable it. Which MDM feature should be configured?',
    choices: ch(
      'Split tunneling',
      'Always-On VPN',
      'Per-app VPN',
      'Certificate-based Wi-Fi (802.1X)'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Always-On VPN forces all device traffic through the VPN tunnel and prevents users from disconnecting it. This is typically enforced via MDM policy on supervised iOS or Android Enterprise devices. Split tunneling does the opposite — it routes only selected traffic through the VPN. Per-app VPN routes only specific app traffic through the VPN. 802.1X is for Wi-Fi authentication, not VPN.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-3-03',
    topicId: 'topic-c1-1-3',
    type: 'single_choice',
    stem: 'Which VPN protocol is native to iOS and Android, recommended for mobile use, and provides fast reconnection when switching between Wi-Fi and cellular?',
    choices: ch(
      'L2TP/IPsec',
      'OpenVPN',
      'IKEv2/IPsec',
      'SSTP'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'IKEv2/IPsec is natively supported on both iOS and Android, providing strong security and fast reconnection (MOBIKE protocol) when a mobile device switches networks (e.g., from Wi-Fi to LTE). This makes it ideal for mobile scenarios. L2TP/IPsec is older and has compatibility issues. OpenVPN requires a third-party app. SSTP is Microsoft-specific and not natively supported on mobile platforms.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-3-04',
    topicId: 'topic-c1-1-3',
    type: 'single_choice',
    stem: 'An employee leaves a company. Their personal iPhone had a corporate Exchange account enrolled with MDM. IT wants to remove corporate data without affecting the user\'s personal photos and apps. What should IT perform?',
    choices: ch(
      'Remote wipe — erases the entire device to factory defaults',
      'Selective wipe (corporate wipe) — removes only the MDM profile and corporate data',
      'Remote lock — locks the device until the employee returns it',
      'OS downgrade — reverts to a version without MDM enrollment'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Selective wipe (also called corporate wipe or unenrollment) removes the MDM profile, corporate email, apps, and data while leaving the user\'s personal photos, messages, and applications intact. This is the standard approach for BYOD devices when employees leave. A full remote wipe erases everything on the device including personal data — appropriate only for lost or stolen corporate-owned devices.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-3-05',
    topicId: 'topic-c1-1-3',
    type: 'single_choice',
    stem: '5G mmWave technology offers speeds of 1–4 Gbps. What is its primary limitation compared to Sub-6 GHz 5G?',
    choices: ch(
      'It requires a special SIM card not available at most carriers',
      'It only operates indoors and cannot penetrate windows',
      'It has very short range (under 100 m) and poor building penetration',
      'It is limited to 100 Mbps due to FCC regulations'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'mmWave (millimeter wave, FR2) 5G uses frequencies of 24–100 GHz, which provide massive bandwidth but have very short effective range (under 100 meters) and are easily blocked by buildings, trees, and even rain. This requires extremely dense small-cell deployment. Sub-6 GHz 5G offers broader coverage similar to LTE with speeds of 100–900 Mbps. Both use the same SIM cards and are not FCC speed-capped.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-3-06',
    topicId: 'topic-c1-1-3',
    type: 'single_choice',
    stem: 'Which email retrieval protocol keeps messages stored on the server, syncs read/unread status across all devices, and is the correct choice for a user accessing email from multiple devices?',
    choices: ch(
      'POP3 on port 110 — downloads mail to one device',
      'SMTP on port 25 — sends outgoing mail',
      'IMAP on port 143 — syncs mail across all devices',
      'MIME — formats email attachments'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'IMAP (Internet Message Access Protocol) on port 143 keeps messages on the server and synchronizes state (read, unread, folders, deleted) across all connected devices. POP3 on port 110 downloads email to a single device and typically deletes it from the server — not suitable for multi-device access. SMTP handles sending (outbound) mail. MIME is a message format standard, not a retrieval protocol.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-3-07',
    topicId: 'topic-c1-1-3',
    type: 'single_choice',
    stem: 'A user adds their corporate Exchange account to their personal Android phone. After setup, they receive a prompt asking them to grant "Device Administrator" rights. What capability does accepting this grant the IT department?',
    choices: ch(
      'The ability to read personal text messages and emails',
      'The ability to remotely wipe the entire device, enforce PIN policy, and require encryption',
      'The ability to install apps without the user\'s knowledge',
      'The ability to access the device camera and microphone remotely'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Accepting Device Administrator rights when enrolling a corporate Exchange account grants IT the ability to enforce security policies including PIN/password requirements, encryption mandates, and remote wipe capability (which can erase the entire device). This is why the user should understand the policy before accepting. IT cannot read personal messages, remotely activate cameras/microphones, or silently install apps via basic device administrator — those require full MDM enrollment.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-1-3-08',
    topicId: 'topic-c1-1-3',
    type: 'single_choice',
    stem: 'Which feature allows a phone to make and receive calls over a Wi-Fi network when cellular signal is unavailable, using the IMS framework?',
    choices: ch(
      'Bluetooth tethering',
      'VoLTE (Voice over LTE)',
      'Wi-Fi Calling',
      'Mobile hotspot'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'Wi-Fi Calling routes voice calls over a Wi-Fi connection using the IMS (IP Multimedia Subsystem) framework, enabling calls in areas with weak cellular coverage but available Wi-Fi (basements, rural buildings with Wi-Fi). It requires carrier support and must be enabled in device settings. VoLTE carries voice as data over the LTE cellular network — it still requires cellular signal. Bluetooth tethering and mobile hotspot share an internet connection, not voice calls.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  // ─── 2.1 TCP/UDP Ports & Protocols (8 questions) ─────────────────────────

  {
    id: 'q-c1-2-1-01',
    topicId: 'topic-c1-2-1',
    type: 'single_choice',
    stem: 'A technician needs to securely transfer files to a Linux server using an encrypted connection. Which protocol and port should they use?',
    choices: ch(
      'FTP on port 21 — standard file transfer',
      'Telnet on port 23 — remote terminal access',
      'SSH/SFTP on port 22 — encrypted file transfer over SSH',
      'HTTP on port 80 — web-based file upload'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'SFTP (SSH File Transfer Protocol) runs entirely over SSH on port 22, providing encrypted file transfer. Despite the name, SFTP is not related to FTP — it is a completely different protocol that tunnels through SSH. FTP on port 21 transmits data including credentials in plaintext. Telnet on port 23 is an unencrypted remote terminal with no file transfer capability. HTTP does not provide encryption or standard file transfer semantics.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-1-02',
    topicId: 'topic-c1-2-1',
    type: 'single_choice',
    stem: 'Which of the following correctly describes the DHCP DORA process in the correct sequence?',
    choices: ch(
      'Discover → Offer → Request → Acknowledge',
      'Discover → Request → Offer → Acknowledge',
      'Discover → Offer → Acknowledge → Request',
      'Request → Offer → Discover → Acknowledge'
    , 'a'),
    correctAnswer: ca('a'),
    explanation: 'DORA stands for Discover → Offer → Request → Acknowledge. The client broadcasts a Discover message; the DHCP server responds with an Offer containing an available IP; the client broadcasts a Request accepting the offer (informing other DHCP servers it was accepted); the server sends an Acknowledge confirming the lease. All other orderings are incorrect.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-1-03',
    topicId: 'topic-c1-2-1',
    type: 'single_choice',
    stem: 'A workstation displays the IP address 169.254.45.100. What does this indicate, and what should the technician check first?',
    choices: ch(
      'The device has a statically assigned RFC 1918 private address — no action needed',
      'The device self-assigned an APIPA address because it could not contact a DHCP server',
      'The device is on an IPv6 link-local subnet and needs a gateway configured',
      'The device received a duplicate IP address from a misconfigured DHCP scope'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: '169.254.x.x is the APIPA (Automatic Private IP Addressing) range. When a Windows device cannot reach a DHCP server, it self-assigns an address in this range. The technician should check: Is the DHCP server running? Is the network cable connected? Is the correct VLAN assigned to the port? Is the DHCP scope exhausted? APIPA addresses cannot route to the internet or other subnets.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-1-04',
    topicId: 'topic-c1-2-1',
    type: 'single_choice',
    stem: 'DNS typically uses UDP port 53 for standard queries. In which specific situation does DNS use TCP port 53 instead?',
    choices: ch(
      'When querying public DNS servers like 8.8.8.8',
      'When using DNSSEC to verify record authenticity',
      'When performing zone transfers between DNS servers or when responses exceed 512 bytes',
      'When the client is using a VPN connection'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'DNS uses UDP port 53 for standard name resolution queries because UDP is faster for single-packet request/response. TCP port 53 is used for zone transfers (replicating the entire DNS database between primary and secondary servers) and for responses that exceed 512 bytes (UDP\'s practical limit without EDNS). DNSSEC uses the same port selection rules based on response size, not a separate port.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-1-05',
    topicId: 'topic-c1-2-1',
    type: 'single_choice',
    stem: 'Which TCP mechanism establishes a connection before data can flow, using the sequence SYN → SYN-ACK → ACK?',
    choices: ch(
      'The TCP four-way handshake',
      'The TCP three-way handshake',
      'The UDP connection setup',
      'The ARP request/reply cycle'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'TCP uses a three-way handshake before data can flow: the client sends SYN (synchronize), the server responds with SYN-ACK (acknowledging the client\'s SYN and sending its own), and the client sends ACK (acknowledging the server\'s SYN). The connection is now established. This is why TCP is "connection-oriented." UDP has no handshake at all — it fires packets immediately without setup.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-1-06',
    topicId: 'topic-c1-2-1',
    type: 'single_choice',
    stem: 'A network administrator wants to monitor device health metrics from network switches and routers and receive alerts when a device goes down. Which protocol and port combination should be configured?',
    choices: ch(
      'Syslog on UDP 514 — receives device log messages',
      'NTP on UDP 123 — synchronizes time across devices',
      'SNMP on UDP 161/162 — monitors device status and receives traps',
      'LDAP on TCP 389 — queries directory services'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'SNMP (Simple Network Management Protocol) on UDP 161 allows a management system to poll devices for health metrics (CPU, memory, interface status). SNMP traps on UDP 162 allow devices to send unsolicited alerts to the manager — for example, when a link goes down. Syslog (UDP 514) collects text log messages but does not support structured metric polling or traps. NTP synchronizes time. LDAP is for directory queries.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-1-07',
    topicId: 'topic-c1-2-1',
    type: 'single_choice',
    stem: 'An FTP client behind a NAT router fails to receive directory listings in active mode but works in passive mode. What explains this behavior?',
    choices: ch(
      'Passive mode uses port 21, which NAT does not block',
      'In active mode, the server initiates the data connection back to the client — this is blocked by NAT; passive mode has the client initiate all connections',
      'Active mode requires UDP which NAT does not support for FTP',
      'Passive mode uses SSL encryption which bypasses the firewall'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'In FTP active mode, the client tells the server its IP and a high port number; the server then connects back to the client on port 20. NAT/firewalls block this inbound connection because it was not initiated from the inside. In passive mode, the server opens a random high port and tells the client to connect to it — the client initiates both connections (control and data), which NAT/firewalls allow for outbound-initiated traffic. Passive mode does not use SSL or UDP.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-1-08',
    topicId: 'topic-c1-2-1',
    type: 'single_choice',
    stem: 'A technician needs to remotely control a Windows desktop with a full graphical interface. Which protocol and port should be used?',
    choices: ch(
      'SSH on port 22 — text-only terminal access',
      'Telnet on port 23 — insecure terminal access',
      'SMB on port 445 — file sharing, not remote desktop',
      'RDP on port 3389 — full graphical remote desktop for Windows'
    , 'd'),
    correctAnswer: ca('d'),
    explanation: 'RDP (Remote Desktop Protocol) on TCP port 3389 provides full graphical remote desktop access to Windows systems. It is the standard protocol for IT remote support and server management. SSH provides encrypted terminal (text) access but not a full GUI by default. Telnet is text-only and unencrypted. SMB on port 445 is for file and printer sharing, not remote desktop control.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  // ─── 2.2 Wireless Networking (8 questions) ───────────────────────────────

  {
    id: 'q-c1-2-2-01',
    topicId: 'topic-c1-2-2',
    type: 'single_choice',
    stem: 'Which 802.11 standard was the FIRST to support both 2.4 GHz and 5 GHz frequency bands simultaneously and introduced MIMO technology?',
    choices: ch(
      '802.11g',
      '802.11a',
      '802.11n',
      '802.11ac'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: '802.11n (Wi-Fi 4) was the first dual-band standard, operating on both 2.4 GHz and 5 GHz, and introduced MIMO (Multiple Input Multiple Output) which uses multiple antennas to increase throughput up to 600 Mbps. 802.11g is 2.4 GHz only at 54 Mbps. 802.11a is 5 GHz only at 54 Mbps. 802.11ac (Wi-Fi 5) is 5 GHz only but introduced MU-MIMO and higher speeds.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-2-02',
    topicId: 'topic-c1-2-2',
    type: 'single_choice',
    stem: 'An office has multiple neighboring Wi-Fi networks on 2.4 GHz. Which three channels should be used to avoid co-channel interference between all networks?',
    choices: ch(
      'Channels 1, 3, and 6',
      'Channels 1, 6, and 11',
      'Channels 2, 7, and 12',
      'Channels 1, 5, and 9'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'On the 2.4 GHz band, only channels 1, 6, and 11 are non-overlapping in North America. Each channel is 22 MHz wide and channels are spaced 5 MHz apart, so only every 5 channels (1, 6, 11) have no spectral overlap. Using any other channel combination causes adjacent-channel interference with neighbors. The 5 GHz band has 24+ non-overlapping channels and this rule does not apply there.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-2-03',
    topicId: 'topic-c1-2-2',
    type: 'single_choice',
    stem: 'Which wireless encryption protocol is considered completely broken and crackable in minutes using widely available tools?',
    choices: ch(
      'WPA2-Personal with AES-CCMP',
      'WPA3 with SAE',
      'WPA with TKIP',
      'WEP'
    , 'd'),
    correctAnswer: ca('d'),
    explanation: 'WEP (Wired Equivalent Privacy) is completely broken. It uses the RC4 cipher with a flawed key scheduling algorithm that allows an attacker to crack the key by collecting a few thousand packets — achievable in minutes. WPA-TKIP is vulnerable but requires more effort. WPA2 with AES-CCMP is strong and is the current minimum standard. WPA3 with SAE is the strongest current option, resistant to offline dictionary attacks.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-2-04',
    topicId: 'topic-c1-2-2',
    type: 'single_choice',
    stem: 'A large enterprise wants each wireless user to authenticate with their own unique credentials rather than a shared Wi-Fi password. Which WPA2 mode should be deployed?',
    choices: ch(
      'WPA2-Personal (PSK) — all users share one passphrase',
      'WPA2-Enterprise (802.1X) — each user authenticates individually via RADIUS',
      'WPA3-SAE — replaces PSK with forward secrecy',
      'WEP-Enterprise — provides per-user keys via RADIUS'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'WPA2-Enterprise (802.1X) requires each user to authenticate individually, typically with a username and password (or certificate), verified by a RADIUS server. This provides per-user accountability and allows revoking individual access without changing the password for everyone. WPA2-Personal uses a single pre-shared key everyone knows. WPA3-SAE improves the handshake but still uses a shared passphrase in personal mode. WEP-Enterprise is not a viable standard.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-2-05',
    topicId: 'topic-c1-2-2',
    type: 'single_choice',
    stem: '802.11ax (Wi-Fi 6) introduced OFDMA. What does OFDMA enable that improves performance in dense environments?',
    choices: ch(
      'It allows the AP to transmit at higher power levels in the 6 GHz band',
      'It allows one AP to communicate with multiple clients simultaneously by dividing a channel into sub-channels',
      'It doubles the channel width to 320 MHz for increased throughput per client',
      'It enables backward compatibility with 802.11b devices'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'OFDMA (Orthogonal Frequency Division Multiple Access) divides a single Wi-Fi channel into resource units (sub-channels) that can be assigned to different clients simultaneously. This dramatically improves efficiency in dense environments (offices, stadiums) where many clients need small amounts of data at the same time. 802.11n introduced MIMO; 802.11ac introduced MU-MIMO; 802.11ax added OFDMA plus uplink MU-MIMO.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-2-06',
    topicId: 'topic-c1-2-2',
    type: 'single_choice',
    stem: 'What is the maximum theoretical data rate of the 802.11ac (Wi-Fi 5) standard?',
    choices: ch(
      '600 Mbps',
      '54 Mbps',
      '3.5+ Gbps',
      '9.6 Gbps'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: '802.11ac (Wi-Fi 5) achieves a maximum theoretical speed of 3.5+ Gbps using 160 MHz channel bonding and MU-MIMO. It operates exclusively on the 5 GHz band. 802.11n peaks at 600 Mbps. 802.11a/g peak at 54 Mbps. 802.11ax (Wi-Fi 6) achieves up to 9.6 Gbps. For the exam, know that ac = up to ~3.5 Gbps on 5 GHz, ax = up to 9.6 Gbps on 2.4/5/6 GHz.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-2-07',
    topicId: 'topic-c1-2-2',
    type: 'single_choice',
    stem: 'A user hides their home Wi-Fi SSID. Which statement is TRUE about hidden SSIDs as a security measure?',
    choices: ch(
      'Hidden SSIDs provide strong security because attackers cannot find the network without the name',
      'Hidden SSIDs are not a security measure — the SSID is visible in probe requests from connecting clients',
      'Hidden SSIDs require WPA3 to function correctly',
      'Hidden SSIDs prevent unauthorized devices from connecting even if they know the password'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'A hidden SSID (disabling beacon broadcast) provides no real security. When a legitimate client device connects, it sends probe requests that include the SSID in plaintext — any wireless sniffer can capture these and reveal the hidden SSID. Security comes from strong encryption (WPA2/WPA3) and a strong passphrase, not from hiding the network name. Hiding the SSID only adds inconvenience for legitimate users who must manually enter the name.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-2-08',
    topicId: 'topic-c1-2-2',
    type: 'single_choice',
    stem: 'What is the key security improvement WPA3 provides over WPA2 regarding password attacks?',
    choices: ch(
      'WPA3 uses 128-bit AES instead of 64-bit RC4',
      'WPA3 requires a minimum 20-character passphrase',
      'WPA3 uses SAE (Simultaneous Authentication of Equals) which prevents offline dictionary attacks even if the handshake is captured',
      'WPA3 requires certificate-based authentication eliminating passwords entirely'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'WPA3 replaces the WPA2 4-way handshake with SAE (Simultaneous Authentication of Equals, based on Dragonfly). SAE is resistant to offline dictionary attacks: even if an attacker captures the authentication exchange, they cannot test passwords offline without interacting with the AP for each guess. WPA2 handshakes can be captured and then cracked offline at high speed. WPA3 also provides forward secrecy. WPA2 already uses AES-128, not RC4.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },

  // ─── 2.3 Networked Host Services (8 questions) ───────────────────────────

  {
    id: 'q-c1-2-3-01',
    topicId: 'topic-c1-2-3',
    type: 'single_choice',
    stem: 'What is a DHCP reservation and how does it differ from a static IP assignment?',
    choices: ch(
      'A reservation blocks an IP from being assigned to any device — it is permanently excluded from the scope',
      'A reservation assigns a fixed IP to a specific MAC address through DHCP, so the device always gets the same IP while still being centrally managed',
      'A reservation gives a device higher priority in the IP assignment queue during DORA',
      'A reservation is the same as a static IP configured manually on the device'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'A DHCP reservation (also called a DHCP static mapping) binds a specific IP address to a device\'s MAC address. Every time that device makes a DHCP request, the server always assigns the reserved IP. Unlike a manually-configured static IP on the device, DHCP reservations are managed centrally from the DHCP server — easier to document, audit, and change. An IP exclusion (not a reservation) removes an IP from the pool entirely.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-3-02',
    topicId: 'topic-c1-2-3',
    type: 'single_choice',
    stem: 'What is AAA in network security, and which protocol is most commonly used to implement it for Wi-Fi and VPN access control?',
    choices: ch(
      'Authentication, Authorization, Accounting — implemented with RADIUS on ports 1812/1813',
      'Authentication, Administration, Access — implemented with LDAP on port 389',
      'Authorization, Auditing, Access control — implemented with Kerberos on port 88',
      'Accounting, Auditing, Authentication — implemented with SNMP on port 161'
    , 'a'),
    correctAnswer: ca('a'),
    explanation: 'AAA stands for Authentication (who are you?), Authorization (what can you do?), and Accounting (what did you do?). RADIUS (Remote Authentication Dial-In User Service) is the most common AAA protocol for network access control, used with WPA2-Enterprise Wi-Fi and VPN. RADIUS uses UDP port 1812 for authentication and 1813 for accounting. LDAP queries directories. Kerberos authenticates domain logins. SNMP monitors devices.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-3-03',
    topicId: 'topic-c1-2-3',
    type: 'single_choice',
    stem: 'Kerberos authentication fails if the clocks between the client and server differ by more than how many minutes?',
    choices: ch(
      '1 minute',
      '5 minutes',
      '15 minutes',
      '30 minutes'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Kerberos requires clock synchronization within 5 minutes between the client and the KDC (Key Distribution Center / domain controller). This is a security measure to prevent replay attacks using captured tickets. If clocks differ by more than 5 minutes, authentication fails with a "clock skew" error. This is why NTP is critical in Active Directory environments — Kerberos depends on accurate synchronized time.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-3-04',
    topicId: 'topic-c1-2-3',
    type: 'single_choice',
    stem: 'Which type of proxy server sits in front of web servers, receives client requests, and forwards them to backend servers — providing load balancing and SSL termination?',
    choices: ch(
      'Forward proxy — clients send requests through it to reach the internet',
      'Transparent proxy — intercepts traffic without client configuration',
      'Reverse proxy — sits in front of servers to protect and distribute traffic',
      'SOCKS proxy — tunnels all types of traffic at Layer 5'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'A reverse proxy sits in front of backend servers and handles client requests on their behalf. It provides load balancing (distributing requests across multiple servers), SSL termination (decrypting HTTPS before forwarding to backend), and hides the internal server topology. A forward proxy sits between clients and the internet (content filtering, caching). A transparent proxy intercepts without client configuration. SOCKS is a general-purpose proxy protocol.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-3-05',
    topicId: 'topic-c1-2-3',
    type: 'single_choice',
    stem: 'What is the difference between an IDS and an IPS in network security?',
    choices: ch(
      'IDS blocks malicious traffic inline; IPS only alerts and logs',
      'IDS and IPS are different names for the same technology',
      'IDS monitors passively and alerts; IPS sits inline and actively blocks malicious traffic',
      'IDS is hardware-based; IPS is always software-based'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'IDS (Intrusion Detection System) is passive — it monitors a copy of traffic (via SPAN port or tap) and generates alerts but does not block anything. IPS (Intrusion Prevention System) is inline — traffic passes through it, allowing it to actively drop or block malicious packets in real time. Both use signature-based and anomaly-based detection. The key distinction: IDS detects and alerts, IPS detects and prevents.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-3-06',
    topicId: 'topic-c1-2-3',
    type: 'single_choice',
    stem: 'A DNS A record, AAAA record, and CNAME record are all types of DNS resource records. Which record maps a hostname to an IPv6 address?',
    choices: ch(
      'A record — maps hostname to IPv4 address',
      'AAAA record — maps hostname to IPv6 address',
      'CNAME record — alias pointing to another hostname',
      'PTR record — reverse lookup mapping IP to hostname'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'AAAA records (quad-A) map a hostname to an IPv6 address. The A record maps to IPv4 (32-bit address). CNAME creates an alias pointing to another hostname (e.g., www.example.com → example.com). PTR records are used for reverse DNS lookups — mapping an IP address back to a hostname. MX records point to mail servers for a domain.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-3-07',
    topicId: 'topic-c1-2-3',
    type: 'single_choice',
    stem: 'A Syslog severity level of 0 is defined as Emergency. What does a lower Syslog severity number indicate?',
    choices: ch(
      'Lower priority — level 0 is informational',
      'Higher severity — level 0 is the most critical (Emergency)',
      'Level 0 means the message is encrypted and unreadable',
      'Level 0 indicates a successful operation'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Syslog severity levels run from 0 (Emergency — system unusable) to 7 (Debug). Lower numbers = higher severity. Level 0 = Emergency. Level 3 = Error. Level 5 = Notice. Level 7 = Debug. This is counter-intuitive but tested on the exam. Systems administrators set a minimum severity threshold — for example, "log level 3 and above" captures Errors, Critical, Alert, and Emergency messages.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-3-08',
    topicId: 'topic-c1-2-3',
    type: 'single_choice',
    stem: 'Which file-sharing protocol is used natively by Windows for shared folders (\\\\server\\share) and is also used by Samba on Linux for cross-platform sharing?',
    choices: ch(
      'NFS on port 2049',
      'FTP on port 21',
      'SMB on port 445',
      'IPP on port 631'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'SMB (Server Message Block) on TCP port 445 is Windows\' native file and printer sharing protocol, accessed via UNC paths like \\\\server\\share. Samba is an open-source Linux/Unix implementation of SMB that enables cross-platform file sharing. NFS (port 2049) is the Unix/Linux native sharing protocol. FTP is for file transfer, not networked storage. IPP (port 631) is for print sharing.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  // ─── 2.4 Network Configuration (8 questions) ─────────────────────────────

  {
    id: 'q-c1-2-4-01',
    topicId: 'topic-c1-2-4',
    type: 'single_choice',
    stem: 'A host with IP address 192.168.10.50 and subnet mask 255.255.255.0 needs to communicate with 10.0.0.5. What will the host do?',
    choices: ch(
      'Send the packet directly to 10.0.0.5 since all RFC 1918 addresses are on the same network',
      'Drop the packet because 10.x.x.x addresses are public internet addresses',
      'Forward the packet to its default gateway because 10.0.0.5 is outside the 192.168.10.0/24 subnet',
      'Use ARP to resolve 10.0.0.5 directly on the local subnet'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'With subnet mask /24 (255.255.255.0), the host\'s network is 192.168.10.0. The destination 10.0.0.5 is in a different network. When a destination is not on the local subnet, the host sends the packet to its default gateway (router) which routes it onward. The host uses ARP only to find the MAC address of its default gateway, not of 10.0.0.5. Both addresses are RFC 1918 private but they are on different networks.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-4-02',
    topicId: 'topic-c1-2-4',
    type: 'single_choice',
    stem: 'A /26 subnet is applied to a network. How many usable host IP addresses does this subnet support?',
    choices: ch(
      '64',
      '62',
      '30',
      '126'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'A /26 subnet has 6 host bits (32 − 26 = 6). Total addresses = 2^6 = 64. Usable hosts = 64 − 2 = 62 (one address reserved as the network address, one as the broadcast address). A /25 provides 126 usable hosts, /27 provides 30, /24 provides 254. The formula is always 2^(host bits) − 2.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-4-03',
    topicId: 'topic-c1-2-4',
    type: 'single_choice',
    stem: 'An IPv6 address starts with fe80::. What type of IPv6 address is this, and what is its scope?',
    choices: ch(
      'Global unicast — routable on the public internet',
      'Unique local — equivalent to RFC 1918 private addresses',
      'Link-local — auto-configured, valid only on the directly connected link',
      'Multicast — sends to a group of IPv6 hosts'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'fe80::/10 is the IPv6 link-local prefix. Link-local addresses are automatically configured on every IPv6 interface and are only valid on the directly connected network segment — they cannot be routed between networks. Global unicast addresses start with 2000::/3 and are internet-routable. Unique local addresses (fc00::/7) are IPv6\'s equivalent of RFC 1918 private space. Multicast uses ff00::/8.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-4-04',
    topicId: 'topic-c1-2-4',
    type: 'single_choice',
    stem: 'What is the purpose of VLAN trunking (802.1Q) between switches?',
    choices: ch(
      'It encrypts inter-VLAN traffic using 802.1X authentication',
      'It allows a single physical link to carry traffic for multiple VLANs by adding a 4-byte tag to Ethernet frames',
      'It bonds multiple physical cables together for higher bandwidth (LACP)',
      'It prevents loops in switched networks by blocking redundant paths (STP)'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: '802.1Q VLAN trunking adds a 4-byte tag to Ethernet frames that identifies which VLAN the frame belongs to. This allows a single physical link (trunk port) between switches to carry traffic for multiple VLANs. Without trunking, a separate physical cable would be needed per VLAN between switches. 802.1X is port-based authentication. LACP/bonding combines links for bandwidth. STP prevents switching loops.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-4-05',
    topicId: 'topic-c1-2-4',
    type: 'single_choice',
    stem: 'What technology allows many internal devices with private IP addresses to share a single public IP address by tracking connections using unique source port numbers?',
    choices: ch(
      'NAT (Network Address Translation) — one-to-one address mapping',
      'PAT (Port Address Translation) / NAT Overload — many-to-one using port tracking',
      'DHCP — assigns private IPs from a pool',
      'VPN — tunnels private traffic over public internet'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'PAT (Port Address Translation), also called NAT Overload or colloquially just "NAT," allows many internal devices to share one public IP by assigning unique source port numbers to each internal connection. The router maintains a translation table mapping [internal IP:port] → [public IP:unique port]. Basic NAT is one-to-one (one private IP maps to one public IP). DHCP assigns addresses but does not handle internet sharing. VPN creates encrypted tunnels but does not address IP sharing.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-4-06',
    topicId: 'topic-c1-2-4',
    type: 'single_choice',
    stem: 'Which IP address range is reserved for loopback testing and always resolves to the local machine?',
    choices: ch(
      '169.254.0.0/16 — APIPA self-assigned addresses',
      '10.0.0.0/8 — large private network range',
      '127.0.0.0/8 — loopback, with 127.0.0.1 (localhost) being most common',
      '192.168.0.0/16 — small office/home private range'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: '127.0.0.0/8 is reserved for loopback — any address in this range routes back to the local machine. 127.0.0.1 is "localhost" and is used to test local TCP/IP stack functionality without sending traffic to the network. 169.254.x.x is APIPA. 10.0.0.0/8 and 192.168.0.0/16 are RFC 1918 private ranges used on internal networks.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-4-07',
    topicId: 'topic-c1-2-4',
    type: 'single_choice',
    stem: 'A remote access VPN uses split tunneling. What traffic behavior does this produce?',
    choices: ch(
      'All traffic — corporate and internet — is routed through the VPN',
      'Only traffic destined for corporate resources goes through the VPN; internet traffic bypasses the VPN',
      'The VPN tunnel is split between two different VPN servers for redundancy',
      'Traffic is split by protocol — TCP goes through the VPN, UDP bypasses it'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Split tunneling routes only traffic destined for corporate internal resources through the VPN tunnel; all other internet traffic (streaming, general web browsing) goes directly to the internet without passing through the VPN. This reduces VPN server load and improves performance for internet-bound traffic. The trade-off is that non-tunneled traffic is not protected by the VPN. Full tunnel VPNs route all traffic through the corporate gateway.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-4-08',
    topicId: 'topic-c1-2-4',
    type: 'single_choice',
    stem: 'Which class of IPv4 address has a first octet in the range 192–223 and a default subnet mask of 255.255.255.0 (/24)?',
    choices: ch(
      'Class A',
      'Class B',
      'Class C',
      'Class D'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'Class C addresses have first octets ranging from 192–223 with a default subnet mask of /24 (255.255.255.0), providing up to 254 usable hosts per network. Class A uses octets 1–126 with /8 default mask (millions of hosts). Class B uses 128–191 with /16 (65,534 hosts). Class D (224–239) is reserved for multicast and has no subnet mask. The 192.168.x.x range used in home networks is Class C RFC 1918 space.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

  // ─── 2.5 Networking Hardware (8 questions) ───────────────────────────────

  {
    id: 'q-c1-2-5-01',
    topicId: 'topic-c1-2-5',
    type: 'single_choice',
    stem: 'At which OSI layer does a switch operate, and what does it use to forward frames?',
    choices: ch(
      'Layer 1 (Physical) — forwards signals to all ports',
      'Layer 2 (Data Link) — forwards frames based on MAC addresses',
      'Layer 3 (Network) — forwards packets based on IP addresses',
      'Layer 4 (Transport) — forwards segments based on TCP/UDP ports'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'A switch operates at OSI Layer 2 (Data Link) and uses MAC addresses to make forwarding decisions. The switch builds a MAC address table (CAM table) by observing source MAC addresses arriving on each port. When a frame arrives, the switch looks up the destination MAC and forwards only to the correct port. Hubs operate at Layer 1 (repeat everything). Routers at Layer 3 use IP addresses. Layer 4 is the Transport layer handled by end hosts.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-5-02',
    topicId: 'topic-c1-2-5',
    type: 'single_choice',
    stem: 'A technician needs to power a newly installed IP camera located 40 meters from the nearest switch. The camera supports PoE+ (802.3at). What is the maximum power the switch port can deliver to this camera?',
    choices: ch(
      '15.4 W (PoE 802.3af)',
      '30 W (PoE+ 802.3at)',
      '60 W (PoE++ 802.3bt Type 3)',
      '100 W (USB PD maximum)'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'PoE+ (802.3at) delivers a maximum of 30 W to the powered device. The camera supports PoE+ so the switch port (which must also be 802.3at capable) can deliver up to 30 W. Standard PoE (802.3af) delivers 15.4 W — sufficient for IP phones and basic cameras. PoE++ (802.3bt) delivers 60 W or 90 W for laptops and high-power PTZ cameras. USB PD is not an Ethernet standard.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-5-03',
    topicId: 'topic-c1-2-5',
    type: 'single_choice',
    stem: 'What is the maximum cable run distance for Cat 6 Ethernet when operating at 10 Gbps?',
    choices: ch(
      '100 meters',
      '55 meters',
      '25 meters',
      '10 meters'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Cat 6 supports 1 Gbps at the standard 100-meter maximum. For 10 Gbps operation, Cat 6 is limited to 55 meters due to crosstalk at higher frequencies. Cat 6a (augmented) supports 10 Gbps at the full 100 meters by using better insulation and larger conductors to reduce alien crosstalk. For 10GbE runs longer than 55 meters, Cat 6a or fiber should be used.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-5-04',
    topicId: 'topic-c1-2-5',
    type: 'single_choice',
    stem: 'Which networking device separates broadcast domains, preventing broadcasts from passing between networks?',
    choices: ch(
      'Hub — forwards all traffic including broadcasts to all ports',
      'Switch — separates collision domains but not broadcast domains',
      'Router — separates both broadcast and collision domains',
      'Access point — separates wireless collision domains'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'Routers separate broadcast domains — broadcast traffic does not cross a router interface. This is why large networks use routers (or Layer 3 switches) to segment networks. Switches separate collision domains (each port is its own collision domain) but all ports on a switch share the same broadcast domain by default. Hubs share collision domains. VLANs on a switch create separate broadcast domains without a physical router.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-5-05',
    topicId: 'topic-c1-2-5',
    type: 'single_choice',
    stem: 'A technician needs to terminate a cable run into a keystone jack in a wall plate. Which tool makes the electrical connection between wire and the IDC connector?',
    choices: ch(
      'Cable crimper — attaches RJ-45 connectors to cable ends',
      'Punchdown tool — seats wires into IDC terminations on keystones and patch panels',
      'Cable stripper — removes the outer jacket before termination',
      'Loopback plug — tests port hardware functionality'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'A punchdown tool (impact tool) forces wire conductors into IDC (Insulation Displacement Connector) contacts on keystone jacks and patch panels. The tool simultaneously cuts the insulation and seats the conductor in the metal contact. The crimper attaches RJ-45 connectors to the end of a cable (not used for keystones or patch panels). The cable stripper removes the outer jacket before any termination. A loopback plug tests port hardware.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-5-06',
    topicId: 'topic-c1-2-5',
    type: 'single_choice',
    stem: 'In a data center, which device serves as a passive termination point where permanent cable runs end, making it easy to reconfigure connections with short patch cables?',
    choices: ch(
      'Switch — provides active Layer 2 forwarding',
      'Patch panel — passive termination point for permanent cable runs',
      'PoE injector — adds power to a cable for a single device',
      'Modem — converts digital to analog signal'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'A patch panel is a passive device with ports where permanent cable runs (from offices, cubicles, or server rooms) terminate. Technicians use short patch cables to connect patch panel ports to switch ports, making it easy to move, add, or change connections without disturbing the permanent cable runs in walls and ceilings. Switches are active Layer 2 devices. A PoE injector adds power to one cable. A modem converts signals for WAN connectivity.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-5-07',
    topicId: 'topic-c1-2-5',
    type: 'single_choice',
    stem: 'What is the purpose of a DMZ in network security architecture?',
    choices: ch(
      'To provide additional Wi-Fi coverage in dead zones',
      'To isolate public-facing servers so a compromise does not give direct access to the internal network',
      'To store backup data in a geographically separate location',
      'To create a separate VLAN for IoT devices with restricted internet access'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'A DMZ (Demilitarized Zone) is a network segment between the untrusted internet and the trusted internal network. Public-facing servers (web, email, DNS) are placed here. If an attacker compromises a DMZ server, they are still isolated from the internal corporate network by the inner firewall. This defense-in-depth architecture limits the blast radius of a breach. A DMZ is not for Wi-Fi extension, backup, or IoT isolation.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-5-08',
    topicId: 'topic-c1-2-5',
    type: 'single_choice',
    stem: 'Which Ethernet cable type uses STP (Shielded Twisted Pair) and is appropriate for high-EMI industrial environments?',
    choices: ch(
      'Cat 5e UTP — unshielded, standard office use',
      'Cat 6 UTP — unshielded, improved crosstalk performance',
      'STP cable — shielded against electromagnetic interference',
      'RG-6 coax — used for cable TV and DOCSIS'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'STP (Shielded Twisted Pair) cables have a metallic foil or braid shielding around the conductor pairs that blocks external electromagnetic interference (EMI). This makes STP appropriate for industrial environments near motors, generators, and other EMI sources. UTP (Unshielded Twisted Pair) — Cat 5e, 6, 6a — uses only twisting to reduce crosstalk and is suitable for normal office environments. RG-6 coax is used for cable TV and DOCSIS internet.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  // ─── 2.6 SOHO Networks (8 questions) ─────────────────────────────────────

  {
    id: 'q-c1-2-6-01',
    topicId: 'topic-c1-2-6',
    type: 'single_choice',
    stem: 'A technician sets up a new SOHO router. Which FIRST action should be taken before configuring other settings?',
    choices: ch(
      'Enable UPnP for automatic port forwarding',
      'Configure port forwarding for remote desktop access',
      'Change the default administrator password',
      'Set up a guest Wi-Fi network'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'Changing the default administrator password is always the first step when configuring any network device. Default credentials (admin/admin, admin/password) are publicly documented and are the first thing attackers try. All other configuration — wireless settings, port forwarding, guest networks — should happen after securing access to the admin interface. Enabling UPnP is a security risk and should generally be disabled.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-6-02',
    topicId: 'topic-c1-2-6',
    type: 'single_choice',
    stem: 'A user wants to host a Minecraft server at home. The server runs on port 25565. Which router feature must be configured to allow inbound connections from the internet?',
    choices: ch(
      'QoS — to prioritize gaming traffic',
      'Port forwarding — directs inbound port 25565 traffic to the server\'s internal IP',
      'DHCP reservation — ensures the server always gets the same IP',
      'Guest network — isolates the server from other devices'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Port forwarding (destination NAT) is required to allow inbound internet connections to reach an internal device. Without it, the router\'s NAT drops all unsolicited inbound connections. The technician configures: external port 25565 → internal IP of the server → internal port 25565, TCP protocol. A DHCP reservation is also best practice to ensure the server\'s IP doesn\'t change, but it alone does not enable inbound access. QoS prioritizes outbound traffic. Guest network isolates clients.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-6-03',
    topicId: 'topic-c1-2-6',
    type: 'single_choice',
    stem: 'Why should WPS (Wi-Fi Protected Setup) be disabled on a SOHO router?',
    choices: ch(
      'WPS slows down Wi-Fi speeds by 50% when enabled',
      'WPS PIN mode has a critical vulnerability allowing brute-force attacks in hours',
      'WPS is incompatible with WPA2 and WPA3 security',
      'WPS disables the 5 GHz band on dual-band routers'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'The WPS PIN method has a design flaw: the 8-digit PIN is verified in two 4-digit halves, reducing the attack space from 10^8 to 10^4 + 10^4 combinations. An attacker can brute-force the PIN in hours with tools like Reaver, then derive the Wi-Fi password. The push-button method (PBC) is safer but still has risks. The recommendation is to disable WPS entirely. WPS does not affect speeds or band availability.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-6-04',
    topicId: 'topic-c1-2-6',
    type: 'single_choice',
    stem: 'A home network uses the 192.168.1.0/24 subnet. The DHCP pool assigns 192.168.1.100–192.168.1.200. A printer is manually configured with IP 192.168.1.50. What problem might occur, and how should it be resolved?',
    choices: ch(
      'No problem — 192.168.1.50 is outside the DHCP pool and will not conflict',
      'The printer IP falls outside the pool, but a DHCP client could be manually given 192.168.1.50, creating a conflict — use a DHCP exclusion or reservation',
      'The printer should use 192.168.1.255, the broadcast address, for static assignment',
      'Static IPs must be outside the /24 subnet entirely to avoid DHCP conflicts'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'While 192.168.1.50 is currently outside the DHCP pool (100–200), a technician could manually assign it to another device, causing a conflict. Best practice is to either add a DHCP exclusion for 192.168.1.50 (preventing the DHCP server from ever assigning it) or better yet, configure a DHCP reservation binding 192.168.1.50 to the printer\'s MAC address so DHCP manages the IP centrally. Static IPs must still be within the subnet — 192.168.1.255 is the broadcast address.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-6-05',
    topicId: 'topic-c1-2-6',
    type: 'single_choice',
    stem: 'A parent wants to block all internet access for a child\'s device between 10 PM and 7 AM. Which SOHO router feature supports this?',
    choices: ch(
      'Port forwarding — redirects the device\'s traffic to a blocked port',
      'QoS — limits bandwidth to near zero during those hours',
      'Schedule-based access control / parental controls — restricts internet by device and time',
      'DMZ host — puts the device outside the firewall'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'Schedule-based access controls, found in most SOHO router parental control features, allow restricting internet access for specific devices (by MAC address or device name) during defined time windows. Port forwarding redirects inbound connections and does not restrict a device\'s outbound access. QoS prioritizes traffic but does not block it. A DMZ host actually receives less firewall protection, not more blocking.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-6-06',
    topicId: 'topic-c1-2-6',
    type: 'single_choice',
    stem: 'What is the purpose of a SOHO guest network, and what critical isolation feature must be enabled?',
    choices: ch(
      'A guest network provides faster speeds for visitors by using dedicated hardware',
      'A guest network is a separate SSID that gives internet access while isolating guests from the primary network and other guest devices',
      'A guest network uses WEP for backward compatibility with older guest devices',
      'A guest network is required by law for any business that offers public Wi-Fi'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'A guest network provides internet access to visitors without allowing them to see or access devices on the primary network (NAS, printers, computers). Critical settings: enable client isolation (prevents guest-to-guest communication), use a separate SSID, place it on a separate VLAN or subnet, and set a strong guest password. Guest networks use the same encryption (WPA2/WPA3) as the primary — not WEP. There is no universal legal requirement for guest networks.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-6-07',
    topicId: 'topic-c1-2-6',
    type: 'single_choice',
    stem: 'QoS on a SOHO router is configured to prioritize VoIP calls above all other traffic. What problem does this solve?',
    choices: ch(
      'It encrypts VoIP packets to prevent eavesdropping',
      'It prevents choppy, dropped, or delayed audio during calls when bandwidth is saturated by other traffic',
      'It routes VoIP calls through a different ISP for redundancy',
      'It compresses VoIP audio to reduce bandwidth consumption'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'VoIP is highly sensitive to latency, jitter, and packet loss. When other traffic (downloads, streaming) saturates the uplink, VoIP packets can be delayed or dropped, causing choppy or dropped audio. QoS prioritizes VoIP packets to the front of the queue, ensuring they are transmitted first even when bandwidth is constrained. QoS does not encrypt traffic, provide redundancy, or compress audio — it only controls forwarding priority.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-6-08',
    topicId: 'topic-c1-2-6',
    type: 'single_choice',
    stem: 'Which SOHO router security hardening action specifically prevents a neighbor or passerby from modifying router settings while connected to the Wi-Fi?',
    choices: ch(
      'Disabling remote management over WAN (internet)',
      'Disabling wireless admin access so management is only possible via wired LAN connection',
      'Changing the SSID from the default router model name',
      'Enabling UPnP for automatic port management'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Disabling admin access via the wireless interface means that even if someone connects to the Wi-Fi (as a guest or with a known password), they cannot access the router\'s admin interface — they must be physically connected via Ethernet. Disabling remote management over the WAN prevents internet-based admin access. Both are recommended, but the question specifically asks about wireless-connected users. Changing the SSID is good practice but does not restrict admin access. UPnP is a security risk.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },

  // ─── 2.7 Internet Connection Types (8 questions) ─────────────────────────

  {
    id: 'q-c1-2-7-01',
    topicId: 'topic-c1-2-7',
    type: 'single_choice',
    stem: 'A customer complains that their DSL internet speeds drop significantly during evening hours. What is the MOST likely cause?',
    choices: ch(
      'DSL is slower in the evening because telephone companies throttle it outside business hours',
      'DSL speed degrades over longer distances from the DSLAM — this does not explain time-of-day variation',
      'DSL is an asymmetric service so upload is always slower than download at any hour',
      'Cable internet, not DSL, is the technology affected by neighborhood shared bandwidth during peak hours'
    , 'd'),
    correctAnswer: ca('d'),
    explanation: 'Cable internet (DOCSIS) uses a shared coaxial infrastructure within a neighborhood node — bandwidth is shared among all users. During peak hours (evenings), congestion causes speed drops for everyone on that node. DSL uses dedicated copper pairs to each home from the DSLAM, so neighbors do not affect your speed. DSL speed degrades with distance but this is a constant characteristic, not time-dependent. The customer likely has cable, not DSL.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-7-02',
    topicId: 'topic-c1-2-7',
    type: 'single_choice',
    stem: 'Fiber optic internet requires which device at the customer premises to convert the optical signal to Ethernet?',
    choices: ch(
      'Cable modem (DOCSIS)',
      'DSL modem with splitter',
      'ONT (Optical Network Terminal)',
      'PoE injector'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'An ONT (Optical Network Terminal) is installed where the fiber enters the building. It converts the optical light-pulse signal from the fiber into an Ethernet signal that connects to the customer\'s router. A cable modem (DOCSIS) is for coaxial cable internet. A DSL modem connects to phone line infrastructure. A PoE injector adds power to Ethernet cables and is unrelated to WAN connectivity.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-7-03',
    topicId: 'topic-c1-2-7',
    type: 'single_choice',
    stem: 'Which internet connection type is MOST appropriate for a remote farm with no cable or DSL infrastructure but requiring internet access?',
    choices: ch(
      'Metro Ethernet — fiber-based urban service',
      'T1 leased line — guaranteed symmetric bandwidth',
      'Satellite internet — available anywhere with a clear sky view',
      'VDSL — very fast DSL for short copper runs'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'Satellite internet (GEO or LEO like Starlink) is available anywhere with a clear view of the sky, making it the solution for rural and remote locations without cable or DSL infrastructure. Metro Ethernet and T1 leased lines require physical cable runs to the building. VDSL is a DSL variant requiring proximity to telephone exchange copper infrastructure — not available in remote areas.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-7-04',
    topicId: 'topic-c1-2-7',
    type: 'single_choice',
    stem: 'A company compares two internet options: GEO satellite at 50 Mbps with 500 ms latency, and 4G LTE at 30 Mbps with 40 ms latency. For VoIP calls, which is the better choice and why?',
    choices: ch(
      'GEO satellite — higher bandwidth means better call quality',
      '4G LTE — lower latency is critical for real-time voice; 500 ms round-trip delay makes calls unusable',
      'Both are equivalent for VoIP since voice uses minimal bandwidth',
      'GEO satellite — it has more reliable signal than cellular'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: '4G LTE with 40 ms latency is far better for VoIP than GEO satellite with 500 ms latency. VoIP requires low latency (ideally under 150 ms one-way) for natural conversation — a 500 ms round-trip delay creates an awkward half-second pause between speaking and the other party hearing you. Bandwidth matters far less for voice calls which use very little (typically 80–100 kbps per call). LEO satellite (Starlink, ~20–60 ms) would also be acceptable for VoIP.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-7-05',
    topicId: 'topic-c1-2-7',
    type: 'single_choice',
    stem: 'Which internet connection type provides symmetric speeds (equal upload and download), is immune to electrical interference, and does not degrade with distance?',
    choices: ch(
      'ADSL — asymmetric, copper, distance-limited',
      'Cable (DOCSIS) — coaxial, shared medium, faster download',
      'Fixed wireless — radio signal, affected by line of sight',
      'Fiber optic — symmetric, immune to EMI, no copper degradation'
    , 'd'),
    correctAnswer: ca('d'),
    explanation: 'Fiber optic internet transmits data as light pulses through glass or plastic fibers. It provides symmetric speeds (equal upload/download), is immune to electromagnetic interference (no metal conductors), and does not experience the signal degradation over distance that copper cables suffer. ADSL is asymmetric and distance-limited. Cable DOCSIS provides faster download than upload and shares neighborhood bandwidth. Fixed wireless uses radio signals that can be affected by interference and line-of-sight obstacles.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-7-06',
    topicId: 'topic-c1-2-7',
    type: 'single_choice',
    stem: 'What is the difference between bandwidth and throughput in networking?',
    choices: ch(
      'Bandwidth is measured in milliseconds; throughput is measured in Mbps',
      'Bandwidth is the maximum theoretical capacity of a link; throughput is the actual data rate achieved in practice',
      'Bandwidth describes latency; throughput describes packet loss',
      'They are different names for the same measurement'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Bandwidth is the maximum theoretical capacity of a network link (like the width of a highway). Throughput is the actual data rate achieved, which is always less than bandwidth due to protocol overhead, retransmissions, congestion, and other factors (like the actual cars getting through per hour). Latency measures delay (time for a packet to travel from source to destination), which is a separate metric. Packet loss is yet another distinct metric.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-7-07',
    topicId: 'topic-c1-2-7',
    type: 'single_choice',
    stem: 'A T1 leased line provides which bandwidth and what key characteristic that makes it suitable for business use?',
    choices: ch(
      '100 Mbps symmetric with unlimited data — enterprise fiber',
      '1.544 Mbps symmetric with a guaranteed SLA — legacy dedicated circuit',
      '50 Mbps download / 5 Mbps upload — ADSL business tier',
      '44.736 Mbps symmetric — DS3 equivalent speed'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'A T1 line provides exactly 1.544 Mbps of symmetric bandwidth (24 DS0 channels × 64 kbps each). Its defining characteristic for business use is the guaranteed bandwidth with an SLA (Service Level Agreement) — unlike best-effort broadband, the ISP guarantees the bandwidth and response time for outages. T1 is largely legacy technology being replaced by fiber internet with VPN. T3 provides 44.736 Mbps (28 T1s).',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-7-08',
    topicId: 'topic-c1-2-7',
    type: 'single_choice',
    stem: 'Fixed Wireless Access (FWA) uses which technology to deliver internet to a stationary home or business without a physical cable?',
    choices: ch(
      'Dial-up modem over telephone lines',
      'Satellite signals from geostationary orbit',
      'A directional antenna pointed at a nearby cellular or licensed wireless tower',
      'Powerline networking over existing electrical wiring'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'Fixed Wireless Access uses a directional antenna mounted on the building pointed at a nearby base station or tower using cellular or licensed wireless spectrum. This provides internet to locations without cable or fiber without requiring physical cable installation. Satellite uses signals from orbit and has different characteristics. Dial-up uses telephone lines with a modem. Powerline networking uses existing electrical wiring but only within a building, not for WAN connectivity.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  // ─── 2.8 Networking Tools (8 questions) ──────────────────────────────────

  {
    id: 'q-c1-2-8-01',
    topicId: 'topic-c1-2-8',
    type: 'single_choice',
    stem: 'A technician pulls a new cable run but the link light does not illuminate. Which tool should be used FIRST to verify the cable is correctly wired end-to-end?',
    choices: ch(
      'Toner probe — to trace the cable through the wall',
      'Loopback plug — to test the NIC hardware',
      'Cable tester — to verify all 8 conductors are properly connected',
      'Wi-Fi analyzer — to check for wireless interference'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'A cable tester is the correct first tool when a newly pulled cable won\'t link. It sends signals through each pin pair and verifies all 8 conductors are connected, in the correct order, with no opens (broken wires), shorts (wires touching), or split pairs. The toner probe traces cable routes — useful if the cable is unlabeled but not for verifying wiring continuity. A loopback plug tests port hardware, not the cable. A Wi-Fi analyzer is for wireless diagnostics.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-8-02',
    topicId: 'topic-c1-2-8',
    type: 'single_choice',
    stem: 'A user reports they can ping 192.168.1.1 (their default gateway) but cannot browse any websites. What should the technician test next?',
    choices: ch(
      'Run tracert to the default gateway to check for hops',
      'Test DNS resolution using nslookup google.com',
      'Run ipconfig /release to release the IP address',
      'Use a loopback plug to test the NIC hardware'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'If the user can ping the gateway but not browse websites, the most likely cause is DNS failure. Browsers use hostnames (google.com) which must be resolved to IP addresses. Using nslookup google.com tests whether DNS is resolving correctly. If nslookup fails, the DNS server address may be wrong or the DNS server may be unreachable. The IP and gateway are confirmed good (ping passes), so ipconfig /release would break connectivity. The NIC is clearly working since ping succeeds.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-8-03',
    topicId: 'topic-c1-2-8',
    type: 'single_choice',
    stem: 'Which command releases the current DHCP lease and requests a new IP address assignment on a Windows computer?',
    choices: ch(
      'ipconfig /flushdns — clears the DNS resolver cache',
      'ipconfig /release followed by ipconfig /renew',
      'netstat -r — displays the routing table',
      'nslookup /reset — resets DNS server configuration'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'ipconfig /release sends a DHCPRELEASE message to give up the current IP lease. ipconfig /renew then sends a DHCPDISCOVER to get a new IP assignment from the DHCP server. This is useful when a device has an incorrect IP or APIPA address and the DHCP issue has been fixed. ipconfig /flushdns clears cached DNS records (a separate action). netstat -r shows the routing table. There is no nslookup /reset command.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-8-04',
    topicId: 'topic-c1-2-8',
    type: 'single_choice',
    stem: 'A technician is troubleshooting an intermittent connectivity issue and needs to see exactly which router hops traffic takes and where latency increases. Which tool is most appropriate?',
    choices: ch(
      'ping — confirms if a host responds',
      'ipconfig — shows local IP configuration',
      'tracert (Windows) / traceroute (Linux) — shows each router hop and latency to each',
      'netstat — shows active connections and listening ports'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'tracert/traceroute sends packets with incrementing TTL values, causing each router in the path to return a "TTL Exceeded" message. This reveals the IP address of each hop and the round-trip time, allowing the technician to pinpoint exactly where latency spikes or where the path fails. ping only confirms whether the final destination responds — it doesn\'t show intermediate hops. ipconfig shows local configuration. netstat shows active connections on the local machine.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-8-05',
    topicId: 'topic-c1-2-8',
    type: 'single_choice',
    stem: 'A security analyst needs to capture and inspect all packets on a network segment for malware analysis. Which tool captures and displays complete packet contents by protocol layer?',
    choices: ch(
      'Toner probe — detects cable tones through walls',
      'Wireshark (packet analyzer) — captures and dissects all packets on the interface',
      'netstat — shows established connections on the local machine',
      'nslookup — queries DNS records'
    , 'b'),
    correctAnswer: ca('b'),
    explanation: 'Wireshark is a packet analyzer (protocol analyzer) that captures every packet on a network interface and displays the complete contents broken down by protocol layer: Ethernet frame, IP header, TCP/UDP header, and application payload. This is ideal for malware analysis, protocol debugging, and security investigation. A toner probe detects cable runs. netstat shows local TCP/IP state. nslookup queries DNS — none of these capture raw packets.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-8-06',
    topicId: 'topic-c1-2-8',
    type: 'single_choice',
    stem: 'A technician needs to identify which unlabeled cable in a bundle runs to a specific wall jack. Which tool set is designed exactly for this purpose?',
    choices: ch(
      'Cable tester — checks wiring continuity end-to-end',
      'Loopback plug — tests NIC port hardware',
      'Toner probe (fox and hound) — generates an audible tone at one end, detected inductively at the other',
      'Wi-Fi analyzer — maps wireless signal levels'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'A toner probe kit (tone generator + inductive amplifier, sometimes called "fox and hound") is specifically designed for cable tracing. The tone generator connects to one end of the cable at the wall jack; the technician uses the inductive amplifier probe near cables in the wiring closet or patch panel to listen for the tone — no physical connection needed at the probe end. The cable tester requires access to both ends simultaneously. The loopback plug tests port hardware. Wi-Fi analyzer is for wireless.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-8-07',
    topicId: 'topic-c1-2-8',
    type: 'single_choice',
    stem: 'The netstat -b command on Windows shows which process is using a specific port. What privilege level is required?',
    choices: ch(
      'Standard user — any user can run netstat -b',
      'Power User group membership',
      'Administrator — netstat -b requires elevated privileges',
      'Domain Administrator only'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'netstat -b (which shows the executable/process name owning each connection or listening port) requires Administrator privileges on Windows. Running it without elevation shows an "Access Denied" message or omits the process names. Basic netstat commands (netstat -a, netstat -n) run without elevation. This is relevant when troubleshooting which process has a port open or investigating suspicious connections.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c1-2-8-08',
    topicId: 'topic-c1-2-8',
    type: 'single_choice',
    stem: 'Which networking tool is best suited for detecting rogue access points, identifying channel congestion, and measuring signal strength (RSSI) in a wireless environment?',
    choices: ch(
      'Cable certifier (Fluke DTX) — measures copper cable performance',
      'Network tap — passively copies traffic for monitoring',
      'Wi-Fi analyzer (hardware or software) — scans and displays wireless environment details',
      'Punchdown tool — terminates wires into IDC connectors'
    , 'c'),
    correctAnswer: ca('c'),
    explanation: 'A Wi-Fi analyzer scans the wireless environment and displays all visible SSIDs, their signal strength (RSSI in dBm), channels used, security type, and band (2.4/5 GHz). This is the correct tool for detecting rogue APs, identifying channel congestion (helping select the least-congested channel), measuring coverage, and diagnosing interference. A cable certifier tests copper cable performance. A network tap captures wired traffic. A punchdown tool terminates cable — all unrelated to wireless analysis.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },

]
