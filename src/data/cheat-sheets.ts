export interface CheatSheetTermsSection {
  type: 'terms'
  title: string
  items: Array<{ term: string; definition: string }>
}

export interface CheatSheetTableSection {
  type: 'table'
  title: string
  columns: string[]
  rows: string[][]
  caption?: string
}

export interface CheatSheetProcessSection {
  type: 'process'
  title: string
  steps: Array<{ label: string; detail?: string }>
}

export interface CheatSheetComparisonSection {
  type: 'comparison'
  title: string
  leftLabel: string
  rightLabel: string
  rows: Array<{ attribute: string; left: string; right: string }>
}

export type CheatSheetSection =
  | CheatSheetTermsSection
  | CheatSheetTableSection
  | CheatSheetProcessSection
  | CheatSheetComparisonSection

export type CheatSheetExam = 'core1' | 'core2'

export type CheatSheetDomain =
  | 'mobile-devices'
  | 'networking'
  | 'hardware'
  | 'virtualization-cloud'
  | 'hw-network-troubleshooting'
  | 'operating-systems'
  | 'security'
  | 'software-troubleshooting'
  | 'operational-procedures'

export interface CheatSheet {
  topicSlug: string
  objectiveId: string
  title: string
  exam: CheatSheetExam
  domainSlug: CheatSheetDomain
  domainName: string
  examCode: string
  accentColor: string
  summary: string
  sections: CheatSheetSection[]
}

export const CHEAT_SHEETS: CheatSheet[] = [
  // ─── Core 1 ───────────────────────────────────────────────────────────────

  {
    topicSlug: '2-1-tcp-udp-ports-protocols',
    objectiveId: '2.1',
    title: 'TCP/UDP Ports & Protocols',
    exam: 'core1',
    domainSlug: 'networking',
    domainName: 'Networking',
    examCode: '220-1201',
    accentColor: 'var(--apple-blue)',
    summary: 'Well-known port numbers, transport protocol characteristics, and common application-layer protocols tested on the exam.',
    sections: [
      {
        type: 'comparison',
        title: 'TCP vs UDP',
        leftLabel: 'TCP',
        rightLabel: 'UDP',
        rows: [
          { attribute: 'Connection type', left: 'Connection-oriented (3-way handshake)', right: 'Connectionless' },
          { attribute: 'Reliability', left: 'Guaranteed delivery, retransmission', right: 'Best-effort, no retransmission' },
          { attribute: 'Speed', left: 'Slower — overhead from error checking', right: 'Faster — minimal overhead' },
          { attribute: 'Ordering', left: 'Packets sequenced and reordered', right: 'No guaranteed order' },
          { attribute: 'Use cases', left: 'HTTP, HTTPS, FTP, SMTP, SSH', right: 'DNS, DHCP, TFTP, VoIP, streaming' },
        ],
      },
      {
        type: 'table',
        title: 'Well-Known Ports — Must Memorize',
        columns: ['Port', 'Protocol', 'Transport', 'Purpose'],
        rows: [
          ['20', 'FTP Data', 'TCP', 'File transfer — data channel'],
          ['21', 'FTP Control', 'TCP', 'File transfer — control/commands'],
          ['22', 'SSH', 'TCP', 'Encrypted remote shell'],
          ['23', 'Telnet', 'TCP', 'Unencrypted remote shell (legacy)'],
          ['25', 'SMTP', 'TCP', 'Send email between servers'],
          ['53', 'DNS', 'TCP/UDP', 'Domain name → IP resolution'],
          ['67', 'DHCP Server', 'UDP', 'Server sends IP offers'],
          ['68', 'DHCP Client', 'UDP', 'Client requests/receives IP'],
          ['80', 'HTTP', 'TCP', 'Unencrypted web traffic'],
          ['110', 'POP3', 'TCP', 'Receive email — downloads & deletes from server'],
          ['143', 'IMAP', 'TCP', 'Receive email — syncs, stays on server'],
          ['161', 'SNMP', 'UDP', 'Network device monitoring'],
          ['389', 'LDAP', 'TCP', 'Directory services (Active Directory)'],
          ['443', 'HTTPS', 'TCP', 'TLS-encrypted web traffic'],
          ['445', 'SMB', 'TCP', 'Windows file/printer sharing'],
          ['3389', 'RDP', 'TCP', 'Remote Desktop Protocol'],
        ],
        caption: 'Ports 0–1023 = Well-known | 1024–49151 = Registered | 49152–65535 = Dynamic/Ephemeral',
      },
      {
        type: 'terms',
        title: 'Key Terms',
        items: [
          { term: 'Port', definition: 'Logical endpoint for a network service, identified by a 16-bit number (0–65535).' },
          { term: 'Socket', definition: 'IP address + port number combined; uniquely identifies a connection endpoint.' },
          { term: '3-Way Handshake', definition: 'TCP session setup: SYN → SYN-ACK → ACK.' },
          { term: 'Ephemeral Port', definition: 'Temporary client-side port assigned per connection (49152–65535).' },
          { term: 'Stateful', definition: 'TCP tracks connection state (established, closing). UDP is stateless.' },
        ],
      },
    ],
  },

  {
    topicSlug: '3-2-cables-connectors',
    objectiveId: '3.2',
    title: 'Cables & Connectors',
    exam: 'core1',
    domainSlug: 'hardware',
    domainName: 'Hardware',
    examCode: '220-1201',
    accentColor: 'var(--apple-indigo)',
    summary: 'Ethernet cable categories, fiber types, video connectors, USB standards, and connector identification.',
    sections: [
      {
        type: 'table',
        title: 'Ethernet Cable Categories',
        columns: ['Category', 'Max Speed', 'Max Distance', 'Notes'],
        rows: [
          ['Cat 5', '100 Mbps', '100 m', 'Legacy — rarely used'],
          ['Cat 5e', '1 Gbps', '100 m', 'Most common in older installs; crosstalk reduction'],
          ['Cat 6', '1 Gbps / 10 Gbps*', '100 m / 55 m*', '* 10 Gbps only up to 55 m'],
          ['Cat 6a', '10 Gbps', '100 m', 'Augmented; full 10G at 100 m'],
          ['Cat 7', '10 Gbps', '100 m', 'Shielded (STP); not TIA standard'],
          ['Cat 8', '25–40 Gbps', '30 m', 'Data center use; very short runs'],
        ],
        caption: 'All copper Ethernet uses RJ-45 connectors. UTP = unshielded twisted pair (most common).',
      },
      {
        type: 'comparison',
        title: 'Fiber: Single-Mode vs Multi-Mode',
        leftLabel: 'Single-Mode (SMF)',
        rightLabel: 'Multi-Mode (MMF)',
        rows: [
          { attribute: 'Core diameter', left: '8–10 µm', right: '50–62.5 µm' },
          { attribute: 'Light source', left: 'Laser', right: 'LED or VCSEL' },
          { attribute: 'Distance', left: 'Up to 100 km', right: 'Up to 2 km' },
          { attribute: 'Cost', left: 'Higher', right: 'Lower' },
          { attribute: 'Cable jacket color', left: 'Yellow', right: 'Orange or aqua' },
          { attribute: 'Use case', left: 'WAN, campus backbone', right: 'LAN, data center' },
        ],
      },
      {
        type: 'table',
        title: 'Video Connectors',
        columns: ['Connector', 'Signal', 'Notes'],
        rows: [
          ['VGA', 'Analog only', '15-pin DB-15; no audio'],
          ['DVI-A', 'Analog only', 'Compatible with VGA via adapter'],
          ['DVI-D', 'Digital only', 'Single-link (3.96 Gbps) or Dual-link (7.92 Gbps)'],
          ['DVI-I', 'Analog + Digital', 'Integrated — most flexible DVI type'],
          ['HDMI', 'Digital A/V', 'Up to 4K/8K; carries audio; Type A most common'],
          ['DisplayPort', 'Digital A/V', 'Up to 8K; daisy-chaining; locking connector'],
          ['Thunderbolt 3/4', 'Digital (DP alt mode)', 'USB-C shaped; 40 Gbps; video + data + power'],
        ],
      },
      {
        type: 'table',
        title: 'USB Standards',
        columns: ['Standard', 'Speed', 'Connector(s)', 'Notes'],
        rows: [
          ['USB 1.1', '12 Mbps', 'Type-A, Type-B', 'Full Speed — legacy'],
          ['USB 2.0', '480 Mbps', 'Type-A, Mini, Micro', 'Hi-Speed — still very common'],
          ['USB 3.0 (3.2 Gen 1)', '5 Gbps', 'Type-A (blue), Type-C', 'SuperSpeed'],
          ['USB 3.1 (3.2 Gen 2)', '10 Gbps', 'Type-A, Type-C', 'SuperSpeed+'],
          ['USB 3.2 Gen 2×2', '20 Gbps', 'Type-C only', 'Dual-lane'],
          ['USB4', '40 Gbps', 'Type-C only', 'Based on Thunderbolt 3 spec'],
        ],
        caption: 'Blue USB-A port = USB 3.x. Red USB-A port = always-on charging.',
      },
    ],
  },

  {
    topicSlug: '3-3-ram-characteristics',
    objectiveId: '3.3',
    title: 'RAM Characteristics',
    exam: 'core1',
    domainSlug: 'hardware',
    domainName: 'Hardware',
    examCode: '220-1201',
    accentColor: 'var(--apple-indigo)',
    summary: 'RAM types, DDR generations, form factors, ECC vs non-ECC, and memory channel configurations.',
    sections: [
      {
        type: 'table',
        title: 'DDR Generations Comparison',
        columns: ['Type', 'Speed Range', 'Voltage', 'Pins (DIMM)', 'Notes'],
        rows: [
          ['DDR3', '800–2133 MT/s', '1.5 V (1.35 V LP)', '240', 'Legacy; still in older systems'],
          ['DDR4', '2133–3200 MT/s', '1.2 V', '288', 'Most common desktop/laptop RAM today'],
          ['DDR5', '4800–8400+ MT/s', '1.1 V', '288 (diff. notch)', 'Current gen; two 32-bit channels per stick'],
        ],
        caption: 'DDR = Double Data Rate. MT/s = megatransfers per second. Generations are NOT backward compatible.',
      },
      {
        type: 'table',
        title: 'Form Factors',
        columns: ['Form Factor', 'Pins', 'Used In'],
        rows: [
          ['DIMM (full-size)', '288 (DDR4/5), 240 (DDR3)', 'Desktops, servers'],
          ['SO-DIMM', '260 (DDR4/5), 204 (DDR3)', 'Laptops, small form factor PCs, NUCs'],
        ],
      },
      {
        type: 'terms',
        title: 'Key RAM Terms',
        items: [
          { term: 'ECC (Error-Correcting Code)', definition: 'Detects and corrects single-bit memory errors. Used in servers and workstations. Slightly slower than non-ECC.' },
          { term: 'Registered (RDIMM)', definition: 'Has a register between controller and DRAM chips. More stable for large capacities. Server use.' },
          { term: 'Dual-Channel', definition: 'Two sticks in matching slots double the memory bandwidth. Requires identical or matched sticks.' },
          { term: 'Quad-Channel', definition: 'Four matched sticks for 4× bandwidth. Common in HEDT and server platforms.' },
          { term: 'XMP / EXPO', definition: 'Intel XMP / AMD EXPO: BIOS profiles to run RAM above JEDEC spec. Enabled in BIOS.' },
          { term: 'CAS Latency (CL)', definition: 'Clock cycles to respond to a read request. Lower = faster (e.g., CL16 is faster than CL18).' },
          { term: 'Virtual RAM', definition: 'Pagefile / swap space on disk used when physical RAM is full. Much slower than DRAM.' },
        ],
      },
      {
        type: 'process',
        title: 'Installing RAM Correctly',
        steps: [
          { label: 'Power off and unplug the system', detail: 'Never install RAM while powered on.' },
          { label: 'Ground yourself (ESD wrist strap or touch chassis)', detail: 'Static discharge can permanently damage RAM.' },
          { label: 'Check motherboard manual for correct slots', detail: 'Dual-channel usually requires slots 2 & 4 (not 1 & 2).' },
          { label: 'Align notch — DDR4 and DDR5 have different notch positions', detail: 'They are not interchangeable.' },
          { label: 'Press firmly until both side clips click', detail: 'Single motion — do not rock the stick.' },
          { label: 'Boot and verify in BIOS / Task Manager', detail: 'Check speed and total capacity. Enable XMP/EXPO if desired.' },
        ],
      },
    ],
  },

  {
    topicSlug: '1-1-mobile-device-hardware',
    objectiveId: '1.1',
    title: 'Mobile Device Hardware',
    exam: 'core1',
    domainSlug: 'mobile-devices',
    domainName: 'Mobile Devices',
    examCode: '220-1201',
    accentColor: 'var(--apple-teal)',
    summary: 'Laptop, tablet, and smartphone hardware components, display types, and battery technology for the mobile devices domain.',
    sections: [
      {
        type: 'table',
        title: 'Display Technologies',
        columns: ['Technology', 'Backlight', 'Key Traits', 'Common Use'],
        rows: [
          ['TN (Twisted Nematic)', 'LED', 'Fast response, poor viewing angles, lower color accuracy', 'Budget monitors, gaming (older)'],
          ['IPS (In-Plane Switching)', 'LED', 'Wide viewing angles, accurate color, slower response (improving)', 'Laptops, phones, pro monitors'],
          ['VA (Vertical Alignment)', 'LED', 'High contrast ratio, better blacks than IPS, some ghosting', 'TVs, some monitors'],
          ['OLED', 'None (self-emissive)', 'Perfect blacks, infinite contrast, can burn-in, flexible', 'Flagship phones, laptops'],
          ['AMOLED', 'None (self-emissive)', 'OLED + active matrix; power-efficient, vibrant', 'Android flagships'],
        ],
        caption: 'LCD is the umbrella term for TN/IPS/VA — all require a backlight. OLED/AMOLED are self-emissive.',
      },
      {
        type: 'terms',
        title: 'Laptop Hardware Components',
        items: [
          { term: 'DC Jack', definition: 'Power input connector. Failure causes charging issues — repair requires soldering or board swap.' },
          { term: 'Inverter', definition: 'Converts DC to AC for CCFL backlights. Not present in LED backlit displays.' },
          { term: 'Digitizer', definition: 'Touch-sensitive layer over the display. Can be replaced separately from the LCD panel on some devices.' },
          { term: 'Wi-Fi Card (M.2/PCIe)', definition: 'Miniature PCIe card for wireless. Usually replaceable — located under keyboard or bottom panel.' },
          { term: 'SO-DIMM', definition: 'Small outline DIMM — laptop RAM form factor. 260 pins (DDR4/5).' },
          { term: 'M.2 SSD', definition: 'Compact SSD form factor. M-key (NVMe) or B+M-key (SATA). Check keying before purchase.' },
          { term: 'Thermal Paste', definition: 'Applied between CPU/GPU die and heatsink. Dry paste causes overheating. Reapply during deep cleaning.' },
        ],
      },
      {
        type: 'comparison',
        title: 'Battery Chemistry',
        leftLabel: 'Li-Ion',
        rightLabel: 'Li-Po (Li-Polymer)',
        rows: [
          { attribute: 'Shape', left: 'Rigid cylindrical or prismatic', right: 'Flexible pouch — any shape' },
          { attribute: 'Weight', left: 'Heavier', right: 'Lighter for same capacity' },
          { attribute: 'Cost', left: 'Lower', right: 'Higher' },
          { attribute: 'Swelling risk', left: 'Lower', right: 'More prone to swelling when failing' },
          { attribute: 'Typical use', left: 'Older laptops, power tools', right: 'Modern smartphones, thin laptops' },
          { attribute: 'Memory effect', left: 'None', right: 'None' },
        ],
      },
      {
        type: 'table',
        title: 'Mobile Connectivity Standards',
        columns: ['Technology', 'Frequency / Range', 'Notes'],
        rows: [
          ['Bluetooth', '2.4 GHz / ~10 m', 'Pairing required. Class 1 = 100 m. Used for peripherals, audio.'],
          ['Wi-Fi 5 (802.11ac)', '5 GHz / ~35 m indoor', 'MU-MIMO, up to ~3.5 Gbps theoretical'],
          ['Wi-Fi 6 (802.11ax)', '2.4 + 5 GHz / ~35 m', 'OFDMA, BSS Coloring; better in dense environments'],
          ['Wi-Fi 6E', '2.4 + 5 + 6 GHz', '6 GHz band = less interference, more channels'],
          ['NFC', '13.56 MHz / <4 cm', 'Tap-to-pay, pairing, access cards'],
          ['IR', 'Infrared line-of-sight', 'Remote control. Must aim directly; no obstacles.'],
          ['GPS', 'Satellite (~15 m accuracy)', 'Receive-only. Does not transmit. Needs clear sky view.'],
        ],
      },
    ],
  },

  // ─── Core 2 ───────────────────────────────────────────────────────────────

  {
    topicSlug: '2-4-malware',
    objectiveId: '2.4',
    title: 'Malware',
    exam: 'core2',
    domainSlug: 'security',
    domainName: 'Security',
    examCode: '220-1202',
    accentColor: 'var(--apple-red)',
    summary: 'Malware types, attack vectors, and indicators of infection for the Core 2 security domain.',
    sections: [
      {
        type: 'terms',
        title: 'Malware Types',
        items: [
          { term: 'Virus', definition: 'Attaches to a host file; requires user action to execute and spread. Needs a carrier.' },
          { term: 'Worm', definition: 'Self-replicating; spreads automatically across networks without user interaction.' },
          { term: 'Trojan', definition: 'Disguised as legitimate software. Does not self-replicate. Tricks user into installing.' },
          { term: 'Ransomware', definition: 'Encrypts files and demands payment (usually crypto) for the decryption key.' },
          { term: 'Spyware', definition: 'Silently collects user data — keystrokes, browsing habits, credentials.' },
          { term: 'Adware', definition: 'Displays unwanted advertisements. Often bundled with free software (PUP).' },
          { term: 'Rootkit', definition: 'Hides itself and other malware at the OS/kernel level. Hardest to detect and remove.' },
          { term: 'Botnet', definition: 'Network of compromised machines controlled by a C2 (Command and Control) server.' },
          { term: 'Keylogger', definition: 'Records every keystroke to capture passwords, credit cards, and messages.' },
          { term: 'Cryptominer', definition: 'Uses victim\'s CPU/GPU to mine cryptocurrency without consent. Causes high resource usage.' },
          { term: 'Logic Bomb', definition: 'Malicious code that executes when a specific condition is met (date, login, file deletion).' },
        ],
      },
      {
        type: 'table',
        title: 'Indicators of Infection',
        columns: ['Symptom', 'Likely Cause'],
        rows: [
          ['AV suddenly disabled or won\'t start', 'Rootkit or aggressive malware disabling defenses'],
          ['Browser redirects / new toolbars', 'Browser hijacker or adware'],
          ['Files encrypted, ransom note on screen', 'Ransomware'],
          ['CPU/GPU pinned at 100% when idle', 'Cryptominer'],
          ['Unknown admin account created', 'Trojan with backdoor/RAT'],
          ['Outbound traffic spike at night', 'Botnet C2 communication'],
          ['Missing or renamed files', 'Virus or ransomware preparing encryption'],
          ['System sluggishness + pop-ups', 'Spyware or adware'],
          ['Security tools won\'t update', 'Malware blocking update servers'],
        ],
      },
    ],
  },

  {
    topicSlug: '2-6-malware-removal',
    objectiveId: '2.6',
    title: 'Malware Removal',
    exam: 'core2',
    domainSlug: 'security',
    domainName: 'Security',
    examCode: '220-1202',
    accentColor: 'var(--apple-red)',
    summary: 'CompTIA\'s official 6-step malware removal process — the exact sequence tested on the exam.',
    sections: [
      {
        type: 'process',
        title: 'CompTIA 6-Step Malware Removal Process',
        steps: [
          {
            label: '1. Investigate and verify malware symptoms',
            detail: 'Look for: pop-ups, disabled AV, unknown processes, high CPU, changed browser homepage, missing files.',
          },
          {
            label: '2. Quarantine the infected system',
            detail: 'Disconnect from network immediately — unplug Ethernet OR disable Wi-Fi. Prevents spread to other machines.',
          },
          {
            label: '3. Disable System Restore (Windows)',
            detail: 'Malware hides copies in restore points. Disable System Restore to prevent it surviving remediation.',
          },
          {
            label: '4. Remediate — scan and remove',
            detail: 'Boot into Safe Mode or use a bootable rescue disk. Run reputable anti-malware tool. May require multiple tools.',
          },
          {
            label: '5. Schedule scans and run updates',
            detail: 'Update OS patches, AV definitions. Enable real-time protection. Schedule regular scans.',
          },
          {
            label: '6. Enable System Restore, create a restore point',
            detail: 'Re-enable System Restore and create a clean baseline. Document the incident.',
          },
        ],
      },
      {
        type: 'terms',
        title: 'Removal Tools & Techniques',
        items: [
          { term: 'Safe Mode', definition: 'Boots with minimal drivers — many malware types cannot run or hide in Safe Mode.' },
          { term: 'Safe Mode with Networking', definition: 'Safe Mode + network access. Useful for downloading removal tools if not pre-installed.' },
          { term: 'Bootable Rescue Disk', definition: 'Boots a clean OS from USB/CD. Scans infected drive without running its OS. Best for rootkits.' },
          { term: 'System Restore', definition: 'Windows feature that snapshots system state. Can harbor malware — disable before removal.' },
          { term: 'Reimaging', definition: 'Wipe and reinstall OS from clean image. Nuclear option — guarantees clean state. Use when removal fails.' },
        ],
      },
      {
        type: 'table',
        title: 'When to Reimage vs Remove',
        columns: ['Scenario', 'Action'],
        rows: [
          ['Rootkit detected', 'Reimage — rootkits survive most software removal'],
          ['Ransomware encrypted all files', 'Reimage + restore from backup'],
          ['Simple adware/spyware', 'Remove with anti-malware tool'],
          ['Trojan with known signature', 'Remove with anti-malware tool'],
          ['Unknown malware, tools keep failing', 'Reimage'],
          ['Business/healthcare system (compliance)', 'Reimage — liability risk'],
        ],
      },
    ],
  },

  {
    topicSlug: '1-5-windows-cli',
    objectiveId: '1.5',
    title: 'Windows CLI',
    exam: 'core2',
    domainSlug: 'operating-systems',
    domainName: 'Operating Systems',
    examCode: '220-1202',
    accentColor: 'var(--apple-blue)',
    summary: 'Essential Windows command-line tools, their syntax, and use cases — heavily tested on Core 2.',
    sections: [
      {
        type: 'table',
        title: 'Networking Commands',
        columns: ['Command', 'Purpose', 'Key Flags'],
        rows: [
          ['ipconfig', 'Show IP configuration', '/all (full details), /release, /renew, /flushdns'],
          ['ping', 'Test connectivity (ICMP)', '-t (continuous), -l (packet size), -n (count)'],
          ['tracert', 'Trace route to host', '-d (no DNS lookup — faster)'],
          ['nslookup', 'Query DNS records', 'nslookup domain.com [DNS server]'],
          ['netstat', 'Show active connections', '-a (all), -n (numeric), -b (show process), -o (PID)'],
          ['net use', 'Map/disconnect network drive', 'net use Z: \\\\server\\share  |  net use Z: /delete'],
          ['net user', 'Manage local user accounts', 'net user username /add  |  /delete  |  /active:no'],
          ['arp', 'View/modify ARP cache', 'arp -a (show all), arp -d (delete entry)'],
        ],
      },
      {
        type: 'table',
        title: 'System & Disk Commands',
        columns: ['Command', 'Purpose', 'Key Flags/Notes'],
        rows: [
          ['sfc /scannow', 'Scan and repair system files', 'Run as admin. Checks Windows file integrity.'],
          ['chkdsk', 'Check disk for errors', '/f (fix errors), /r (locate bad sectors). Requires reboot on OS drive.'],
          ['diskpart', 'Partition and format disks', 'Interactive: list disk → select disk # → clean → create partition primary'],
          ['format', 'Format a drive', 'format C: /fs:NTFS /q  (quick format)'],
          ['robocopy', 'Robust file copy', 'robocopy src dst /e (subdirs) /mir (mirror)'],
          ['gpupdate /force', 'Force Group Policy refresh', 'Run as admin. /force re-applies all policies.'],
          ['gpresult /r', 'Show applied Group Policy', '/h report.html for full HTML report'],
          ['tasklist', 'List running processes', 'tasklist | find "notepad"'],
          ['taskkill', 'Kill a process', '/pid 1234 /f  |  /im notepad.exe /f'],
        ],
      },
      {
        type: 'table',
        title: 'Shutdown & Recovery Commands',
        columns: ['Command', 'Action'],
        rows: [
          ['shutdown /s /t 0', 'Shutdown immediately'],
          ['shutdown /r /t 0', 'Restart immediately'],
          ['shutdown /a', 'Abort a pending shutdown'],
          ['shutdown /r /o', 'Restart into Advanced Options (WinRE)'],
          ['bcdedit', 'Edit boot configuration data — fix boot issues'],
          ['bootrec /fixmbr', 'Repair Master Boot Record'],
          ['bootrec /fixboot', 'Write new boot sector'],
          ['bootrec /rebuildbcd', 'Scan for Windows installs and rebuild BCD'],
        ],
      },
      {
        type: 'terms',
        title: 'Key Concepts',
        items: [
          { term: 'Run as Administrator', definition: 'Many commands require elevated privileges. Right-click CMD → "Run as administrator".' },
          { term: 'Environment Variables', definition: '%USERPROFILE%, %APPDATA%, %TEMP%, %WINDIR% — use in paths to avoid hardcoding.' },
          { term: 'PowerShell vs CMD', definition: 'PowerShell is a superset — supports all CMD commands plus cmdlets (Get-Process, Stop-Service). Preferred for scripting.' },
          { term: 'Pipe ( | )', definition: 'Sends output of one command as input to another. e.g., tasklist | find "chrome"' },
        ],
      },
    ],
  },

  {
    topicSlug: '4-3-backup-recovery',
    objectiveId: '4.3',
    title: 'Backup & Recovery',
    exam: 'core2',
    domainSlug: 'operational-procedures',
    domainName: 'Operational Procedures',
    examCode: '220-1202',
    accentColor: 'var(--apple-green)',
    summary: 'Backup types, the 3-2-1 rule, RTO/RPO concepts, and recovery procedures for the operational procedures domain.',
    sections: [
      {
        type: 'table',
        title: 'Backup Types',
        columns: ['Type', 'What It Backs Up', 'Clears Archive Bit?', 'Restore Requires'],
        rows: [
          ['Full', 'Everything selected', 'Yes', 'Full backup only'],
          ['Incremental', 'Changes since last full OR incremental', 'Yes', 'Full + all incrementals in order'],
          ['Differential', 'Changes since last full backup', 'No', 'Full + latest differential only'],
          ['Synthetic Full', 'Server-side merge of full + incrementals', 'N/A', 'Single synthetic full'],
          ['Mirror', 'Exact copy — no versioning', 'N/A', 'Mirror copy'],
        ],
        caption: 'Archive bit = flag set when a file is modified. A backup clears it to track what\'s new.',
      },
      {
        type: 'comparison',
        title: 'Incremental vs Differential',
        leftLabel: 'Incremental',
        rightLabel: 'Differential',
        rows: [
          { attribute: 'Backup speed', left: 'Fastest (smallest set)', right: 'Slower (grows each day)' },
          { attribute: 'Storage used', left: 'Least — only changes since last backup', right: 'More — all changes since last full' },
          { attribute: 'Restore speed', left: 'Slowest — restore full + every incremental', right: 'Faster — full + one differential' },
          { attribute: 'Clears archive bit', left: 'Yes — after each backup', right: 'No — archive bit preserved' },
        ],
      },
      {
        type: 'terms',
        title: 'Key Terms',
        items: [
          { term: '3-2-1 Rule', definition: '3 copies of data, on 2 different media types, with 1 copy offsite (cloud or remote location).' },
          { term: 'RTO (Recovery Time Objective)', definition: 'Maximum acceptable downtime. How fast must we be back up? e.g., "4 hours."' },
          { term: 'RPO (Recovery Point Objective)', definition: 'Maximum acceptable data loss measured in time. e.g., "We can lose no more than 1 hour of data."' },
          { term: 'MTBF (Mean Time Between Failures)', definition: 'Average time a device runs before failing. Higher = more reliable.' },
          { term: 'MTTR (Mean Time to Repair)', definition: 'Average time to restore a failed device. Lower = faster recovery.' },
          { term: 'Hot Site', definition: 'Fully operational duplicate facility — immediate failover. Most expensive.' },
          { term: 'Warm Site', definition: 'Partially configured — needs data restore. Hours to days to activate.' },
          { term: 'Cold Site', definition: 'Empty facility with power/connectivity — needs full setup. Cheapest, slowest.' },
        ],
      },
      {
        type: 'process',
        title: 'Restore Process',
        steps: [
          { label: 'Verify the backup is valid and accessible', detail: 'Test restores regularly — an untested backup is not a real backup.' },
          { label: 'Identify the appropriate restore point', detail: 'Choose based on RPO. Most recent clean backup before the incident.' },
          { label: 'Restore full backup first', detail: 'Always start with the full backup regardless of backup type used.' },
          { label: 'Apply incrementals or differential in order', detail: 'Incrementals: apply each chronologically. Differential: apply only the most recent one.' },
          { label: 'Verify data integrity after restore', detail: 'Check file counts, checksums, and application functionality.' },
          { label: 'Document the incident and recovery', detail: 'What failed, when, what was lost, what was restored. Required for compliance.' },
        ],
      },
    ],
  },
]

export function getCheatSheet(topicSlug: string): CheatSheet | undefined {
  return CHEAT_SHEETS.find((s) => s.topicSlug === topicSlug)
}

export function hasCheatSheet(topicSlug: string): boolean {
  return CHEAT_SHEETS.some((s) => s.topicSlug === topicSlug)
}
