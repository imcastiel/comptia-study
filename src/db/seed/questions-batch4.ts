// CompTIA A+ 220-1202 Core 2 — Domain 1: Operating Systems
// Topics 1.7–1.11 | 40 questions (8 per topic)

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

export const BATCH4_QUESTIONS = [

  // ─── 1.7 Windows Networking (8 questions) ────────────────────────────────

  {
    id: 'q-c2-1-7-01',
    topicId: 'topic-c2-1-7',
    type: 'single_choice',
    stem: 'A user runs ipconfig and sees the IP address 169.254.43.12. What does this indicate?',
    choices: ch(
      'The network adapter is configured with a static IP address',
      'The computer cannot reach the DHCP server and has self-assigned an APIPA address',
      'The computer is connected to a private network behind NAT',
      'The DNS server is unreachable but the IP address is valid',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'A 169.254.x.x address is an APIPA (Automatic Private IP Addressing) address. Windows assigns itself an APIPA address when DHCP discovery fails — the DHCP server is unreachable, the cable is disconnected, the switch port is down, or the DHCP scope is exhausted. The device cannot communicate outside its local subnet with an APIPA address.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-7-02',
    topicId: 'topic-c2-1-7',
    type: 'single_choice',
    stem: 'A user has Full Control share permission but only Read NTFS permission on a shared folder. What is the user\'s effective access when connecting over the network?',
    choices: ch(
      'Full Control — share permissions take precedence over NTFS',
      'Full Control — the permissions are combined additively',
      'Read — the more restrictive permission applies',
      'Modify — the average of the two permission levels is applied',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'When accessing a shared folder over the network, Windows applies both share permissions and NTFS permissions and enforces the more restrictive of the two. Full Control share + Read NTFS = Read effective access. NTFS permissions also apply to local access, while share permissions only apply to network access.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-7-03',
    topicId: 'topic-c2-1-7',
    type: 'single_choice',
    stem: 'Which network model requires at least one Domain Controller and provides centralized authentication via Active Directory?',
    choices: ch(
      'Workgroup',
      'HomeGroup',
      'Domain',
      'Peer-to-peer',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'A domain uses Active Directory (AD) and requires at least one Domain Controller (DC). The DC centralizes authentication — users log in with domain credentials that work on any domain-joined computer. This enables Single Sign-On, Group Policy enforcement, and centralized account management. A workgroup is peer-to-peer with no central authority. HomeGroup was removed in Windows 10 version 1803.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-7-04',
    topicId: 'topic-c2-1-7',
    type: 'single_choice',
    stem: 'A technician needs to remotely access the C: drive of a workstation named DESK01 without setting up an explicit share. Which path should they use?',
    choices: ch(
      '\\\\DESK01\\C',
      '\\\\DESK01\\C$',
      '\\\\DESK01\\ADMIN',
      '\\\\DESK01\\IPC$',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'C$ is a Windows hidden administrative share that automatically maps to the root of the C: drive. These shares are created automatically and are accessible only to members of the Administrators group. The dollar sign ($) suffix makes the share hidden from normal network browsing. ADMIN$ maps to the Windows installation directory. IPC$ is used for inter-process communication, not file access.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-7-05',
    topicId: 'topic-c2-1-7',
    type: 'single_choice',
    stem: 'Which VPN protocol uses SSL/TLS over port 443, making it the most firewall-friendly of the built-in Windows VPN options?',
    choices: ch(
      'PPTP',
      'L2TP/IPsec',
      'IKEv2',
      'SSTP',
      'd'
    ),
    correctAnswer: ca('d'),
    explanation: 'SSTP (Secure Socket Tunneling Protocol) encapsulates VPN traffic inside HTTPS (SSL/TLS) on port 443. Because port 443 is almost never blocked by firewalls (it is standard HTTPS traffic), SSTP is the most firewall-friendly Windows VPN protocol. PPTP is deprecated due to weak security. L2TP/IPsec and IKEv2 use UDP ports that may be blocked by strict firewalls.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-7-06',
    topicId: 'topic-c2-1-7',
    type: 'single_choice',
    stem: 'After a user connects to a coffee shop Wi-Fi, they can no longer see other computers on their home office network. Which setting most likely caused this?',
    choices: ch(
      'The firewall was disabled on the public network',
      'The network profile switched to Public, which disables network discovery',
      'The DNS settings changed to use the coffee shop DNS server',
      'The workgroup name was reset to WORKGROUP',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Windows network profiles (Public, Private, Domain) control discovery and sharing settings. When a user connects to an untrusted network like a coffee shop, Windows typically sets the profile to Public, which disables network discovery and file/printer sharing to protect the device. Changing the profile back to Private (Settings > Network & Internet > [connection] > Network profile) restores discovery and sharing.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-7-07',
    topicId: 'topic-c2-1-7',
    type: 'single_choice',
    stem: 'An enterprise VPN is configured so that all user internet traffic routes through the corporate network. A remote employee complains that browsing general websites is very slow. What configuration change would address this while maintaining security for corporate resources?',
    choices: ch(
      'Upgrade the VPN protocol from L2TP to IKEv2',
      'Enable split tunneling so only corporate-bound traffic goes through the VPN',
      'Disable the Windows Firewall on the remote machine',
      'Switch the network profile from Domain to Private',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Split tunneling allows only traffic destined for the corporate network to pass through the VPN tunnel, while general internet traffic uses the user\'s local internet connection directly. This resolves the slowdown caused by routing all traffic through the corporate gateway. Note: many enterprises deliberately disable split tunneling for security reasons — this is a policy trade-off.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-7-08',
    topicId: 'topic-c2-1-7',
    type: 'single_choice',
    stem: 'Which MMC snap-in is used to create and manage Windows Firewall inbound and outbound rules with the most granular control?',
    choices: ch(
      'secpol.msc',
      'firewall.cpl',
      'wf.msc',
      'netsh.msc',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'wf.msc opens Windows Defender Firewall with Advanced Security (WFAS), which provides full control over inbound rules, outbound rules, connection security rules, and monitoring — per profile (Domain, Private, Public). firewall.cpl opens the basic Windows Firewall control panel. secpol.msc is Local Security Policy. netsh is a command-line tool, not an MMC snap-in.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  // ─── 1.8 macOS Features (8 questions) ────────────────────────────────────

  {
    id: 'q-c2-1-8-01',
    topicId: 'topic-c2-1-8',
    type: 'single_choice',
    stem: 'What keyboard shortcut opens Spotlight search on macOS?',
    choices: ch(
      'Cmd+F',
      'Cmd+Space',
      'Ctrl+Space',
      'Cmd+Shift+F',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Cmd+Space opens Spotlight, macOS\'s system-wide search and quick-launch tool. Spotlight can launch applications, find files, perform calculations, convert units, and show word definitions. It is the macOS equivalent of Windows Search (Win+S). Cmd+F is used for Find within applications.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-8-02',
    topicId: 'topic-c2-1-8',
    type: 'single_choice',
    stem: 'A technician needs to check and repair file system errors on a macOS drive. Which built-in tool should they use, and which function within it?',
    choices: ch(
      'Terminal — run fsck',
      'Disk Utility — First Aid',
      'System Settings — Storage',
      'Finder — Get Info',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Disk Utility\'s First Aid function verifies and repairs file system errors on macOS drives, equivalent to running chkdsk on Windows. For the startup (boot) drive, First Aid must be run from macOS Recovery (hold Cmd+R at startup) because the live OS holds the volume. Terminal\'s fsck command is also valid but Disk Utility is the GUI tool tested on the exam.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-8-03',
    topicId: 'topic-c2-1-8',
    type: 'single_choice',
    stem: 'Which macOS security feature controls whether users can run applications downloaded from the internet based on code signing and notarization status?',
    choices: ch(
      'FileVault',
      'XProtect',
      'Gatekeeper',
      'Time Machine',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'Gatekeeper controls which applications can run based on their source and signing status. It can be set to allow only App Store apps, App Store plus identified developers (signed with Apple Developer certificate), or any source. To run an unsigned app, the user right-clicks and selects Open. XProtect is macOS\'s built-in malware signature database. FileVault is full-disk encryption.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-8-04',
    topicId: 'topic-c2-1-8',
    type: 'single_choice',
    stem: 'Time Machine is configured on a Mac with a 1 TB external drive. Which backup behavior is correct?',
    choices: ch(
      'Time Machine creates a full backup every hour, consuming the entire drive quickly',
      'Time Machine stores hourly incremental backups for 24 hours, daily backups for a month, and weekly backups until the drive fills, then deletes the oldest automatically',
      'Time Machine compresses all files before backing up to maximize space',
      'Time Machine only backs up files that have changed since the last manual backup',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Time Machine uses an incremental snapshot strategy: hourly backups for the past 24 hours, daily backups for the past month, and weekly backups for everything older. When the backup drive fills, Time Machine automatically deletes the oldest backups to make room for new ones. Only changed files are stored each cycle, so it is far more space-efficient than full backups.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-8-05',
    topicId: 'topic-c2-1-8',
    type: 'single_choice',
    stem: 'A user plugs a Windows-formatted NTFS external drive into a Mac. What is the default behavior?',
    choices: ch(
      'macOS reads and writes to NTFS drives natively',
      'macOS cannot access NTFS drives at all without third-party software',
      'macOS can read files from the NTFS drive but cannot write to it without third-party software',
      'macOS automatically reformats the drive to APFS on connection',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'By default, macOS can read NTFS drives but cannot write to them. To enable write access, a third-party NTFS driver such as Paragon NTFS or Tuxera NTFS must be installed. If cross-platform read/write access is needed without third-party software, the drive should be formatted as exFAT, which both macOS and Windows support natively with no file size limits.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-8-06',
    topicId: 'topic-c2-1-8',
    type: 'single_choice',
    stem: 'FileVault is enabled on a MacBook and the user forgets their login password. In an enterprise environment, what is the recommended method for recovery?',
    choices: ch(
      'Boot from a macOS USB installer and bypass FileVault automatically',
      'Use the Apple ID linked to the Mac to reset the password',
      'Use the FileVault recovery key escrowed by the MDM solution',
      'Remove the SSD and connect it to another Mac to read the data',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'FileVault encrypts the entire startup disk with XTS-AES-128 encryption. In enterprise deployments, the MDM solution (such as Jamf) escrows the FileVault recovery key during enrollment. If the user forgets their password, IT uses the escrowed recovery key to unlock the drive. Without both the password and the recovery key, the data is unrecoverable — this is why MDM escrow is critical.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-8-07',
    topicId: 'topic-c2-1-8',
    type: 'single_choice',
    stem: 'Which macOS feature provides a bird\'s-eye view of all open windows, Spaces (virtual desktops), and full-screen applications simultaneously?',
    choices: ch(
      'Spotlight',
      'Launchpad',
      'Mission Control',
      'App Exposé',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'Mission Control (F3 or three-finger swipe up on trackpad) shows all open windows, Spaces, and full-screen apps in one overview. From Mission Control, users can switch between Spaces, create new Spaces, and manage which windows are in each Space. App Exposé (swipe down with three fingers or right-click Dock icon > Show All Windows) shows only the windows of the current app.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-8-08',
    topicId: 'topic-c2-1-8',
    type: 'single_choice',
    stem: 'A macOS user wants to connect to a Windows file server using the path \\\\fileserver\\shared. Which Finder menu option and protocol should they use?',
    choices: ch(
      'File > Open > smb://fileserver/shared',
      'Go > Connect to Server (Cmd+K) > smb://fileserver/shared',
      'Finder > Preferences > Servers > fileserver/shared',
      'File > Get Info > Network > smb://fileserver/shared',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'In Finder, Go > Connect to Server (keyboard shortcut Cmd+K) opens a dialog where you enter the server address. For Windows SMB shares, use the smb:// prefix: smb://fileserver/shared. This is the macOS equivalent of mapping a network drive in Windows. Finder also supports AFP and FTP connections via the same dialog.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },

  // ─── 1.9 Linux Features (8 questions) ────────────────────────────────────

  {
    id: 'q-c2-1-9-01',
    topicId: 'topic-c2-1-9',
    type: 'single_choice',
    stem: 'A technician needs to install the Apache web server on an Ubuntu system. Which command is correct?',
    choices: ch(
      'dnf install apache2',
      'yum install httpd',
      'apt install apache2',
      'rpm -i apache2',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'Ubuntu is a Debian-based distribution that uses the APT (Advanced Package Tool) package manager. The correct command is "sudo apt install apache2". DNF and YUM are used on Red Hat-based distributions such as Fedora, RHEL, and CentOS. RPM is the underlying package format for Red Hat systems but is not used directly for dependency-resolving installs.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-9-02',
    topicId: 'topic-c2-1-9',
    type: 'single_choice',
    stem: 'A Linux file has the permission string -rwxr-xr--. What permissions does the group have?',
    choices: ch(
      'Read, write, and execute',
      'Read and execute only',
      'Read only',
      'No permissions',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'In the permission string -rwxr-xr--, the characters are grouped as: file type (-), owner (rwx), group (r-x), others (r--). The group section "r-x" means read (r) and execute (x) but no write (-). In octal, this is 5 (read=4 + execute=1). The owner has full rwx (7), group has r-x (5), others have r-- (4) — making this 754 in octal.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-9-03',
    topicId: 'topic-c2-1-9',
    type: 'single_choice',
    stem: 'Which directory in the Linux file system hierarchy contains system-wide configuration files such as /etc/hosts and /etc/passwd?',
    choices: ch(
      '/var',
      '/usr',
      '/etc',
      '/bin',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: '/etc (pronounced "et-see") is the standard location for system-wide configuration files on Linux. This includes /etc/hosts (hostname-to-IP mappings), /etc/passwd (user account information), /etc/fstab (filesystem mount table), and /etc/ssh/ (SSH configuration). /var holds variable data like logs (/var/log). /usr holds user programs. /bin holds essential binaries.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-9-04',
    topicId: 'topic-c2-1-9',
    type: 'single_choice',
    stem: 'A process with PID 4521 is unresponsive and a normal kill command has no effect. Which command will force-terminate the process immediately?',
    choices: ch(
      'kill -15 4521',
      'kill -9 4521',
      'killall -TERM 4521',
      'stop 4521',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'kill -9 sends SIGKILL (signal 9), which immediately and unconditionally terminates the process — the OS removes it without giving the process a chance to clean up. A normal "kill PID" or "kill -15 PID" sends SIGTERM (signal 15), which is a graceful termination request the process can ignore. Use SIGKILL only when SIGTERM fails, as it can leave temporary files and locks behind.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-9-05',
    topicId: 'topic-c2-1-9',
    type: 'single_choice',
    stem: 'Which command sets the permissions on a script file so the owner has read, write, and execute; the group has read and execute; and others have read and execute?',
    choices: ch(
      'chmod 644 script.sh',
      'chmod 777 script.sh',
      'chmod 755 script.sh',
      'chmod 700 script.sh',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'chmod 755 sets: owner = 7 (rwx = 4+2+1), group = 5 (r-x = 4+0+1), others = 5 (r-x = 4+0+1). This is the standard permission for executable scripts and public directories. chmod 644 gives owner rw- and group/others r-- (no execute). chmod 777 gives everyone full access — a security risk. chmod 700 gives only the owner all permissions.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-9-06',
    topicId: 'topic-c2-1-9',
    type: 'single_choice',
    stem: 'A Linux administrator wants to start the nginx service and ensure it automatically starts on every boot. Which single command accomplishes both actions?',
    choices: ch(
      'systemctl start nginx && systemctl enable nginx',
      'systemctl enable --now nginx',
      'systemctl boot nginx',
      'service nginx start --persist',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'systemctl enable --now nginx combines two actions: "enable" configures nginx to start automatically at boot, and "--now" starts it immediately in the current session. Without --now, "enable" only schedules the service to start at boot — it does not start it right away. The two-command version (start then enable) also works but is less efficient.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-9-07',
    topicId: 'topic-c2-1-9',
    type: 'single_choice',
    stem: 'Which Linux distribution is Debian-based, known for being beginner-friendly, and uses APT for package management?',
    choices: ch(
      'Fedora',
      'CentOS',
      'Ubuntu',
      'RHEL',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'Ubuntu is the most popular Debian-based Linux distribution, widely used for both desktop and server deployments. It uses APT (apt command) for package management and .deb package files. Ubuntu is known for its large community, extensive documentation, and beginner-friendly approach. Fedora, CentOS, and RHEL are all Red Hat-based distributions that use DNF/YUM and .rpm packages.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-9-08',
    topicId: 'topic-c2-1-9',
    type: 'single_choice',
    stem: 'A Linux technician wants to search all files under /var/log for the text "authentication failure" recursively and case-insensitively. Which command is correct?',
    choices: ch(
      'find /var/log -name "authentication failure"',
      'grep -ri "authentication failure" /var/log/',
      'grep "authentication failure" /var/log/*',
      'cat /var/log/ | grep "authentication failure"',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'grep -ri performs a recursive (-r) and case-insensitive (-i) text search through all files in the specified directory tree. "grep -ri \'authentication failure\' /var/log/" will search every file under /var/log/ for the pattern regardless of capitalization. The non-recursive form (without -r) only searches files in the specified directory, not subdirectories. "find" searches for filenames, not file contents.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },

  // ─── 1.10 Application Installation (8 questions) ─────────────────────────

  {
    id: 'q-c2-1-10-01',
    topicId: 'topic-c2-1-10',
    type: 'single_choice',
    stem: 'A user with a 32-bit Windows 10 installation attempts to install a 64-bit application. What will happen?',
    choices: ch(
      'The application will install and run normally via the WOW64 compatibility layer',
      'The installation will fail because a 32-bit OS cannot run 64-bit applications',
      'The application will install but will run slowly due to emulation overhead',
      'Windows will automatically download the 32-bit version instead',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'A 32-bit operating system cannot run 64-bit applications. The 64-bit architecture requires a 64-bit OS to execute its machine code. WOW64 (Windows 32-bit on Windows 64-bit) is a subsystem on 64-bit Windows that allows 32-bit apps to run — it does not work in reverse. To run 64-bit applications, the OS must be 64-bit.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-10-02',
    topicId: 'topic-c2-1-10',
    type: 'single_choice',
    stem: 'On a 64-bit Windows 11 system, where are 32-bit applications installed by default?',
    choices: ch(
      'C:\\Program Files\\',
      'C:\\Program Files (x86)\\',
      'C:\\Windows\\SysWOW64\\',
      'C:\\Apps\\x86\\',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'On a 64-bit Windows system, 64-bit applications install to C:\\Program Files\\ and 32-bit applications install to C:\\Program Files (x86)\\. This separation allows both 32-bit and 64-bit versions of the same application to coexist without conflict. The WOW64 subsystem in Windows handles the translation of 32-bit API calls so they work correctly on the 64-bit OS.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-10-03',
    topicId: 'topic-c2-1-10',
    type: 'single_choice',
    stem: 'An enterprise IT team needs to deploy a .msi application package to 500 computers silently with no user interaction and without automatically rebooting. Which command achieves this?',
    choices: ch(
      'msiexec /i package.msi /quiet /norestart',
      'msiexec /install package.msi /silent',
      'msiexec /x package.msi /quiet',
      'setup.exe /S /norestart',
      'a'
    ),
    correctAnswer: ca('a'),
    explanation: 'msiexec /i installs the package, /quiet suppresses all UI and prompts (completely silent), and /norestart prevents the automatic reboot that some installers trigger. This is the standard silent install command for MSI packages used in enterprise software deployment tools like SCCM, Intune, and PDQ Deploy. /x is used for uninstall, not install.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-10-04',
    topicId: 'topic-c2-1-10',
    type: 'single_choice',
    stem: 'After installing a new application, a user notices that Windows takes significantly longer to boot. Where should the technician look first to resolve this?',
    choices: ch(
      'Services.msc — disable all services added by the application',
      'Task Manager > Startup tab — disable the application\'s startup entry',
      'Registry Editor — delete the HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run key entirely',
      'Programs and Features — repair the application installation',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Many applications add themselves to the Windows startup sequence during installation, causing longer boot times. Task Manager > Startup tab shows all applications configured to launch at startup, along with their startup impact rating. Disabling an unnecessary startup entry does not uninstall the application — it only prevents it from auto-launching at boot. The old location was msconfig > Startup in Windows 7/8.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-10-05',
    topicId: 'topic-c2-1-10',
    type: 'single_choice',
    stem: 'A legacy application designed for Windows 7 refuses to run on Windows 11 and displays compatibility errors. What should the technician try first?',
    choices: ch(
      'Reinstall Windows 11 in 32-bit mode',
      'Run the application in a virtual machine running Windows 7',
      'Right-click the EXE > Properties > Compatibility tab and select Windows 7 compatibility mode',
      'Use the msiexec /compat switch to force compatibility',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'Windows Compatibility Mode (right-click EXE > Properties > Compatibility tab) applies shims that modify certain OS behaviors to mimic older Windows versions. It should be the first troubleshooting step for legacy applications. If compatibility mode fails, a virtual machine running the target OS is the fallback. Compatibility mode does not actually run the old OS — it intercepts specific API calls.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-10-06',
    topicId: 'topic-c2-1-10',
    type: 'single_choice',
    stem: 'A user launches a newly installed application and receives the error "The program can\'t start because MSVCP140.dll is missing from your computer." What is the most likely solution?',
    choices: ch(
      'Reinstall the application using the /repair switch',
      'Install the Microsoft Visual C++ 2015-2022 Redistributable package',
      'Download the missing DLL from a third-party DLL repository website',
      'Update Windows to the latest version via Windows Update',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'MSVCP140.dll is part of the Microsoft Visual C++ 2015-2022 Redistributable package. Applications compiled with Microsoft Visual C++ require this runtime library. If it is missing or the wrong version is installed, the application fails with a "missing DLL" error. The correct fix is to install the appropriate Visual C++ Redistributable from Microsoft — never download DLLs from third-party sites, which is a malware distribution method.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-10-07',
    topicId: 'topic-c2-1-10',
    type: 'single_choice',
    stem: 'A customer needs to run a 16-bit DOS application on their 64-bit Windows 11 workstation. What is the correct solution?',
    choices: ch(
      'Enable WOW64 in Windows Features to support 16-bit applications',
      'Run the application in compatibility mode for Windows XP SP3',
      'Use a virtual machine running a 32-bit OS or use DOSBox',
      'Install the application to C:\\Program Files (x86) to trigger 16-bit support',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: '16-bit applications cannot run on a 64-bit Windows OS at all. WOW64 provides compatibility for 32-bit apps only — it does not support 16-bit code. The only solutions are: a virtual machine running a 32-bit OS (which can run 16-bit apps), DOSBox for DOS applications, or a physical machine running 32-bit Windows. Compatibility mode cannot fix this — it is an architectural limitation.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-10-08',
    topicId: 'topic-c2-1-10',
    type: 'single_choice',
    stem: 'A technician downloads an installer from a vendor website. Before running it, they want to verify the file was not corrupted or tampered with. Which Windows command generates the SHA-256 hash of the file for comparison?',
    choices: ch(
      'hashcheck installer.exe SHA256',
      'md5sum installer.exe',
      'certutil -hashfile installer.exe SHA256',
      'sigverif installer.exe',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'certutil -hashfile [filename] SHA256 is the built-in Windows command to compute the SHA-256 hash of a file. The output is compared against the hash published on the vendor\'s website — a match confirms the file is intact and unmodified. On Linux/macOS, the equivalent command is sha256sum. md5sum generates an MD5 hash (Linux), which is weaker than SHA-256. sigverif checks digital signatures, not hash integrity.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },

  // ─── 1.11 Cloud Productivity Tools (8 questions) ─────────────────────────

  {
    id: 'q-c2-1-11-01',
    topicId: 'topic-c2-1-11',
    type: 'single_choice',
    stem: 'A user sees a cloud icon (outline only) next to a file in OneDrive within File Explorer. What does this icon indicate?',
    choices: ch(
      'The file is currently uploading to OneDrive',
      'The file has a sync error and needs attention',
      'The file exists only in OneDrive and has not been downloaded locally',
      'The file is shared with other users',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'In OneDrive Files On-Demand, a cloud outline icon means the file is online-only — it exists in OneDrive but has not been downloaded to the local device. Clicking the file triggers an on-demand download. A green checkmark means the file is synced and available offline. Blue arrows indicate active syncing. A red X indicates a sync error. This feature saves local disk space on small SSDs.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-11-02',
    topicId: 'topic-c2-1-11',
    type: 'single_choice',
    stem: 'Which Microsoft 365 service stores files shared in Teams channels?',
    choices: ch(
      'OneDrive for Business',
      'Exchange Online',
      'SharePoint',
      'Azure Blob Storage',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'Files shared in Microsoft Teams channels are stored in SharePoint — specifically in the SharePoint site associated with that Team. Files shared in Teams private chats (not channels) are stored in the sender\'s OneDrive for Business. Understanding this distinction is important for IT when managing data retention and access after a user leaves the organization.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-11-03',
    topicId: 'topic-c2-1-11',
    type: 'single_choice',
    stem: 'Which email protocol keeps messages on the server, syncs folder structure across multiple devices, and uses port 993 with SSL encryption?',
    choices: ch(
      'POP3 over SSL',
      'SMTP with STARTTLS',
      'IMAP over SSL (IMAPS)',
      'Exchange ActiveSync',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'IMAP (Internet Message Access Protocol) keeps messages on the server and syncs read/unread status, folders, and flags across multiple devices. IMAPS (IMAP over SSL) uses port 993 with SSL/TLS encryption. POP3 downloads messages to the local device and typically deletes them from the server — it uses port 995 with SSL. SMTP is for sending email, not receiving. Exchange ActiveSync uses port 443 (HTTPS).',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-11-04',
    topicId: 'topic-c2-1-11',
    type: 'single_choice',
    stem: 'A user can receive email but cannot send messages from their configured email client. Which port should the technician verify is not being blocked?',
    choices: ch(
      'Port 110',
      'Port 143',
      'Port 25',
      'Port 587',
      'd'
    ),
    correctAnswer: ca('d'),
    explanation: 'Port 587 is the standard SMTP submission port for authenticated email clients sending outbound mail. ISPs commonly block port 25 (SMTP relay) to prevent spam, which can cause clients misconfigured to use port 25 to fail. Port 587 with STARTTLS is the correct port for end-user mail client outbound submission. Port 110 is POP3 (receiving) and port 143 is IMAP (receiving).',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-11-05',
    topicId: 'topic-c2-1-11',
    type: 'single_choice',
    stem: 'How does Google Workspace differ from Microsoft 365 in terms of application delivery?',
    choices: ch(
      'Google Workspace requires native app installation on every device, similar to Microsoft 365',
      'Google Workspace is primarily browser-based and requires no installation for core apps, while Microsoft 365 includes full desktop applications',
      'Google Workspace only works on Chrome OS devices',
      'Microsoft 365 is browser-only while Google Workspace requires desktop installation',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'Google Workspace (Docs, Sheets, Slides, Gmail, Calendar) runs primarily in the browser with no installation required. An internet connection is needed for most features, though the Google Docs Offline Chrome extension enables limited offline access. Microsoft 365 includes both browser-based versions (Office Online) and full-featured desktop applications that install locally — providing richer functionality offline.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-11-06',
    topicId: 'topic-c2-1-11',
    type: 'single_choice',
    stem: 'An employee leaves the company. What is the FIRST action IT should take regarding their Microsoft 365 account?',
    choices: ch(
      'Delete the account and all associated data immediately to free up the license',
      'Disable the account immediately to revoke all access to cloud services',
      'Change the account password and notify the user',
      'Transfer the OneDrive files to another user before disabling the account',
      'b'
    ),
    correctAnswer: ca('b'),
    explanation: 'The first action must be disabling (not deleting) the Microsoft 365 account immediately upon an employee\'s departure. Disabling stops all access to email, Teams, SharePoint, and other M365 services. The account and its data (mailbox, OneDrive) should be preserved for typically 30 days per the organization\'s retention policy before deletion. Deleting immediately risks losing data needed for compliance, legal holds, or handoffs.',
    difficulty: 2,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-11-07',
    topicId: 'topic-c2-1-11',
    type: 'single_choice',
    stem: 'What is the free storage capacity provided by Google Drive for a personal Google account?',
    choices: ch(
      '5 GB',
      '10 GB',
      '15 GB',
      '2 GB',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'Google Drive provides 15 GB of free storage for personal Google accounts, shared across Google Drive, Gmail, and Google Photos. This is more than the 5 GB free offered by both OneDrive and iCloud, and more than Dropbox\'s 2 GB free tier. For the exam, memorize: OneDrive = 5 GB, Google Drive = 15 GB, Dropbox = 2 GB, iCloud = 5 GB.',
    difficulty: 1,
    tags: null,
    createdAt: NOW,
  },
  {
    id: 'q-c2-1-11-08',
    topicId: 'topic-c2-1-11',
    type: 'single_choice',
    stem: 'A team needs a shared file storage location in Google Workspace where files persist and remain accessible even after individual team members leave the organization. Which Google Workspace feature should IT configure?',
    choices: ch(
      'My Drive with folder sharing',
      'Google Photos shared album',
      'Shared Drives',
      'Google Sites file attachments',
      'c'
    ),
    correctAnswer: ca('c'),
    explanation: 'Google Shared Drives (formerly Team Drives) are organization-owned storage where files belong to the team, not an individual user. Files in Shared Drives remain accessible even when members leave. Files in "My Drive" are owned by the individual — if that person\'s account is deleted, the files may be lost unless ownership is transferred. IT should direct teams to use Shared Drives for all business-critical content.',
    difficulty: 3,
    tags: null,
    createdAt: NOW,
  },

]
