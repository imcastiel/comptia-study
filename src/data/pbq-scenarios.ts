export type PBQCategory = 'networking' | 'security' | 'os' | 'hardware' | 'mobile'

// ── Shared types ────────────────────────────────────────────────────────────

export interface PBQChoice {
  id: string
  text: string
  isCorrect: boolean
  feedback: string
}

interface ToolOutput {
  label: string
  content: string
}

// ── Step type: multiple_choice (default / legacy) ───────────────────────────

export interface PBQStepMultipleChoice {
  type?: 'multiple_choice'
  id: string
  prompt: string
  toolOutput?: ToolOutput
  choices: PBQChoice[]
  hint?: string
}

// ── Step type: drag_match ───────────────────────────────────────────────────
// Drag items on the left to matching targets on the right.

export interface DragMatchItem {
  id: string
  label: string
}

export interface DragMatchTarget {
  id: string
  label: string
  correctItemId: string
}

export interface PBQStepDragMatch {
  type: 'drag_match'
  id: string
  prompt: string
  toolOutput?: ToolOutput
  items: DragMatchItem[]
  targets: DragMatchTarget[]
  feedback: { correct: string; incorrect: string }
  hint?: string
}

// ── Step type: drag_order ───────────────────────────────────────────────────
// Sort items into the correct sequence.

export interface DragOrderItem {
  id: string
  label: string
}

export interface PBQStepDragOrder {
  type: 'drag_order'
  id: string
  prompt: string
  toolOutput?: ToolOutput
  items: DragOrderItem[]
  correctOrder: string[]   // item IDs in correct sequence
  feedback: { correct: string; incorrect: string }
  hint?: string
}

// ── Step type: terminal ─────────────────────────────────────────────────────
// Type commands and see realistic output; submit the right command to proceed.

export interface TerminalCommand {
  command: string
  aliases?: string[]
  output: string
  isCorrect: boolean
  feedback: string
}

export interface PBQStepTerminal {
  type: 'terminal'
  id: string
  prompt: string
  toolOutput?: ToolOutput    // initial context shown above the terminal
  commands: TerminalCommand[]
  defaultOutput: string      // shown for unrecognized commands
  hint?: string
}

// ── Union ───────────────────────────────────────────────────────────────────

export type PBQStep =
  | PBQStepMultipleChoice
  | PBQStepDragMatch
  | PBQStepDragOrder
  | PBQStepTerminal

export function getStepType(step: PBQStep): 'multiple_choice' | 'drag_match' | 'drag_order' | 'terminal' {
  return step.type ?? 'multiple_choice'
}

export interface PBQScenario {
  id: string
  title: string
  category: PBQCategory
  difficulty: 1 | 2 | 3
  estimatedMinutes: number
  objectives: string[]   // exam objective IDs e.g. ['5.5', '2.4']
  examCode: '220-1201' | '220-1202' | 'both'
  summary: string        // 1-sentence description shown on card
  context: string        // full situation description shown at start
  steps: PBQStep[]
}

export const PBQ_SCENARIOS: PBQScenario[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // NETWORKING
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'net-no-internet',
    title: 'No Internet Access — Home User',
    category: 'networking',
    difficulty: 1,
    estimatedMinutes: 8,
    objectives: ['5.5'],
    examCode: '220-1201',
    summary: 'A user can connect to Wi-Fi but cannot browse any websites. Walk through the OSI troubleshooting process.',
    context: `A user calls the help desk and says: "My laptop shows it's connected to Wi-Fi but no websites will load — not even Google. It was working fine yesterday."

You remote in and confirm the taskbar shows Wi-Fi connected with full bars. Your job is to systematically diagnose and fix the problem.`,
    steps: [
      {
        id: 's1',
        prompt: 'What is your FIRST diagnostic step following the CompTIA troubleshooting methodology?',
        choices: [
          { id: 'a', text: 'Reinstall the Wi-Fi adapter driver', isCorrect: false, feedback: 'Driver reinstalls are a later step. You should always gather information and test the basics before making changes.' },
          { id: 'b', text: 'Run ipconfig to check the IP address assignment', isCorrect: true, feedback: 'Correct. Checking ipconfig is a fast, non-destructive first step that immediately tells you if the device has a valid IP — or the dreaded 169.254.x.x APIPA address indicating a DHCP failure.' },
          { id: 'c', text: 'Call the ISP to check for an outage', isCorrect: false, feedback: 'You should exhaust local diagnostics before contacting the ISP. The problem could easily be on the local network.' },
          { id: 'd', text: 'Reset the router to factory defaults', isCorrect: false, feedback: 'Factory reset is a last resort that would disrupt all users on the network. Never take destructive action before diagnosing.' },
        ],
      },
      {
        id: 's2',
        prompt: 'You run ipconfig and see the following. What does this tell you?',
        toolOutput: {
          label: 'ipconfig output',
          content: `Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . :
   IPv4 Address. . . . . . . . . . . : 169.254.83.41
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :`,
        },
        choices: [
          { id: 'a', text: 'The device has a valid private IP from the router', isCorrect: false, feedback: '169.254.x.x is NOT a valid routable IP. It is an APIPA (Automatic Private IP Addressing) address, self-assigned by Windows when DHCP fails.' },
          { id: 'b', text: 'The device failed to get a DHCP lease and self-assigned an APIPA address', isCorrect: true, feedback: 'Correct! 169.254.0.0/16 is the APIPA range. Windows assigns this automatically when a DHCP server is unreachable. No default gateway means no routing to the internet. The DHCP server (typically the router) is the problem.' },
          { id: 'c', text: 'The device is using a static IP that was configured incorrectly', isCorrect: false, feedback: 'APIPA addresses (169.254.x.x) are dynamically self-assigned by the OS, not manually configured. A misconfigured static IP would show a different address.' },
          { id: 'd', text: 'The ISP is blocking the connection at the WAN port', isCorrect: false, feedback: 'The ISP operates at a different layer. APIPA indicates a local DHCP problem, not an ISP issue.' },
        ],
      },
      {
        id: 's3',
        prompt: 'The device has an APIPA address. What is the MOST LIKELY cause and your next step?',
        choices: [
          { id: 'a', text: 'Run ping 169.254.83.1 to test APIPA connectivity', isCorrect: false, feedback: 'Pinging other APIPA hosts is not useful — they also cannot route to the internet. You need to restore DHCP, not confirm APIPA works.' },
          { id: 'b', text: 'Check if the router/DHCP server is online and reachable', isCorrect: true, feedback: 'Correct. APIPA means DHCP failed. The most common causes are: router is powered off, user is connected to the wrong SSID, or the DHCP pool is exhausted. Check the router first.' },
          { id: 'c', text: 'Set a static IP manually on the adapter', isCorrect: false, feedback: 'You could do this as a workaround, but it does not fix the root cause (DHCP failure) and introduces management overhead.' },
          { id: 'd', text: 'Disable and re-enable the Wi-Fi adapter', isCorrect: false, feedback: 'This might trigger a new DHCP request, which could work — but you should first confirm whether the DHCP server is actually reachable before trying workarounds.' },
        ],
      },
      {
        id: 's4',
        prompt: 'You confirm the router is online and reachable from another device. You run "ipconfig /release" then "ipconfig /renew" on the affected laptop. The result is shown below. What is the status now?',
        toolOutput: {
          label: 'ipconfig /renew output',
          content: `Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . : home
   IPv4 Address. . . . . . . . . . . : 192.168.1.47
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`,
        },
        choices: [
          { id: 'a', text: 'Still broken — 192.168.1.x is also a private non-routable address', isCorrect: false, feedback: 'Incorrect. 192.168.1.x with a proper gateway (192.168.1.1) is a valid RFC 1918 private address — the standard for home networks using NAT. This is a healthy DHCP lease.' },
          { id: 'b', text: 'DHCP lease obtained successfully — valid IP, subnet mask, and gateway assigned', isCorrect: true, feedback: 'Correct! The device now has a valid DHCP lease: valid IP (192.168.1.47), correct subnet mask, and a default gateway. Internet should now work.' },
          { id: 'c', text: 'Need to also run ipconfig /flushdns before browsing will work', isCorrect: false, feedback: 'DNS flushing clears the local DNS cache. It can help with stale records, but it is not required after a DHCP renewal. The internet should already work now.' },
          { id: 'd', text: 'The gateway 192.168.1.1 needs to be pinged to confirm connectivity', isCorrect: false, feedback: 'Pinging the gateway is a reasonable verification step, but the question asks about the current status. The DHCP renewal was successful — this is the resolution.' },
        ],
      },
      {
        id: 's5',
        prompt: 'Internet is now working. What should you do before closing the ticket?',
        choices: [
          { id: 'a', text: 'Nothing — it works now, close the ticket immediately', isCorrect: false, feedback: 'You should document the issue and resolution. This helps future troubleshooting and fulfills CompTIA documentation best practices.' },
          { id: 'b', text: 'Document the issue (APIPA due to DHCP lease failure), resolution (ipconfig /release /renew), and verify with the user that everything works', isCorrect: true, feedback: 'Correct. CompTIA emphasizes: verify with the user, document findings, and update the ticket/knowledge base. This also surfaces whether this is a recurring issue that needs a permanent fix.' },
          { id: 'c', text: 'Assign a static IP to prevent this from happening again', isCorrect: false, feedback: 'Static IPs have management overhead. The right long-term solution might be a DHCP reservation (static assignment by MAC at the router level), but only if the issue is recurring. Document first.' },
          { id: 'd', text: 'Restart the router to prevent future DHCP failures', isCorrect: false, feedback: 'Restarting the router disrupts all users and does not address the root cause. It is only warranted if the router has a documented DHCP stability issue.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'net-dns-failure',
    title: 'DNS Resolution Failure',
    category: 'networking',
    difficulty: 2,
    estimatedMinutes: 7,
    objectives: ['5.5', '2.3'],
    examCode: '220-1201',
    summary: 'Websites fail to load by name but IP addresses work. Diagnose and resolve a DNS failure.',
    context: `A user reports that websites won't load: "Chrome just says 'DNS_PROBE_FINISHED_NXDOMAIN' for every site." However, they can ping IP addresses directly. The IT help desk has confirmed there is no office-wide outage.`,
    steps: [
      {
        id: 's1',
        prompt: 'The user can ping IP addresses but not hostnames. What does this tell you?',
        choices: [
          { id: 'a', text: 'The network adapter is faulty', isCorrect: false, feedback: 'If the adapter were faulty, pinging IP addresses would also fail. The adapter and network stack are clearly functional.' },
          { id: 'b', text: 'DNS resolution is broken — TCP/IP connectivity is fine but name-to-IP translation is failing', isCorrect: true, feedback: 'Correct. The ability to ping IPs confirms Layer 3 connectivity is intact. DNS operates at the Application layer. This is a classic DNS-only failure.' },
          { id: 'c', text: 'The default gateway is unreachable', isCorrect: false, feedback: 'If the gateway were unreachable, pinging external IP addresses would also fail. The user CAN ping IPs, so the gateway is working.' },
          { id: 'd', text: 'The firewall is blocking port 80/443', isCorrect: false, feedback: 'DNS uses port 53 (UDP/TCP). HTTP/HTTPS port blocking would still allow DNS to work — hostnames would resolve, but pages would not load. The symptom here is specifically name resolution failure.' },
        ],
      },
      {
        id: 's2',
        prompt: 'You run nslookup to test DNS. What does the output below tell you?',
        toolOutput: {
          label: 'nslookup google.com output',
          content: `Server:  UnKnown
Address:  192.168.1.1

DNS request timed out.
    timeout was 2 seconds.
DNS request timed out.
    timeout was 2 seconds.
*** Request to UnKnown timed-out`,
        },
        choices: [
          { id: 'a', text: 'The DNS server at 192.168.1.1 (the router) is not responding to DNS queries', isCorrect: true, feedback: 'Correct. The device is using the router (192.168.1.1) as its DNS server. The timeouts indicate the router is not answering DNS queries on port 53. This could mean the router\'s DNS relay is broken or it cannot reach upstream DNS servers.' },
          { id: 'b', text: 'Google\'s servers are down', isCorrect: false, feedback: 'The failure is at the local DNS server (192.168.1.1), not at Google. The request never even reached Google.' },
          { id: 'c', text: 'The subnet mask is wrong on the device', isCorrect: false, feedback: 'A wrong subnet mask would cause broader connectivity failures. DNS timeouts from the local server are specifically a DNS/router issue.' },
          { id: 'd', text: 'The computer needs to be restarted to clear its DNS cache', isCorrect: false, feedback: 'A DNS cache issue would cause stale results, not timeouts. Timeouts indicate the DNS server is unreachable or not responding.' },
        ],
      },
      {
        id: 's3',
        prompt: 'You want to test whether the problem is the router\'s DNS relay or the internet DNS servers. What do you do?',
        choices: [
          { id: 'a', text: 'Run nslookup google.com 8.8.8.8 to query Google\'s public DNS directly', isCorrect: true, feedback: 'Correct. By specifying 8.8.8.8 (Google Public DNS), you bypass the router\'s DNS relay entirely and test whether upstream DNS works. If this succeeds, the router\'s DNS relay is the problem. If it also fails, the issue is with internet connectivity itself.' },
          { id: 'b', text: 'Run ping google.com to test DNS', isCorrect: false, feedback: 'ping google.com also requires DNS resolution — it would fail the same way. Use nslookup with an explicit DNS server to isolate the variable.' },
          { id: 'c', text: 'Restart the DNS Client service in Windows', isCorrect: false, feedback: 'The Windows DNS Client service handles local caching, not queries to the server. The issue is with the DNS server (router), not the local service.' },
          { id: 'd', text: 'Run tracert 8.8.8.8 to trace the network path', isCorrect: false, feedback: 'tracert tests network routing, not DNS. It would not help diagnose this specific DNS resolution failure.' },
        ],
      },
      {
        id: 's4',
        prompt: 'nslookup google.com 8.8.8.8 returns a valid IP address. The router\'s DNS relay is the problem. What is the fastest fix to restore internet access right now?',
        choices: [
          { id: 'a', text: 'Manually set DNS to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare) in the network adapter settings', isCorrect: true, feedback: 'Correct. Bypassing the broken router DNS relay by pointing directly to a public DNS server (8.8.8.8 or 1.1.1.1) immediately restores name resolution. This is a fast, targeted fix. You should then investigate and fix the router\'s DNS settings long-term.' },
          { id: 'b', text: 'Reset the router to factory defaults', isCorrect: false, feedback: 'Factory reset would disrupt ALL users and requires reconfiguration. It is a last resort. Manually setting DNS on the affected machine is faster and less disruptive.' },
          { id: 'c', text: 'Run ipconfig /flushdns', isCorrect: false, feedback: 'flushdns clears the local DNS cache. If the DNS server is unreachable/broken, flushing the cache does not help — new queries would still time out.' },
          { id: 'd', text: 'Uninstall and reinstall the network adapter driver', isCorrect: false, feedback: 'The network adapter is functioning correctly (you can ping IPs). Driver reinstall would not fix a DNS server configuration issue.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECURITY
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'sec-malware-removal',
    title: 'Suspected Malware Infection',
    category: 'security',
    difficulty: 2,
    estimatedMinutes: 10,
    objectives: ['2.6', '3.4'],
    examCode: '220-1202',
    summary: 'Follow the CompTIA 8-step malware removal process on a user\'s computer showing infection symptoms.',
    context: `A user reports their computer is acting strange: browsers redirect to unknown sites, antivirus alerts keep popping up and then disappear, the computer is running very slowly, and there are new icons on the desktop they don't recognize.

You determine malware is present. Walk through the proper remediation procedure.`,
    steps: [
      {
        id: 's1',
        prompt: 'Step 1 of the CompTIA malware removal process: You\'ve received the trouble ticket. What is the FIRST formal step?',
        choices: [
          { id: 'a', text: 'Immediately run antivirus software to remove the malware', isCorrect: false, feedback: 'Running AV without quarantining first risks the malware spreading to network shares or other connected devices. Identify and quarantine first.' },
          { id: 'b', text: 'Identify the malware symptoms and investigate the infected system', isCorrect: true, feedback: 'Correct. Step 1 is to identify and investigate symptoms. Document what the user reported, check running processes, startup items, and recent file changes. This gives you information about what type of malware you\'re dealing with.' },
          { id: 'c', text: 'Wipe the drive and reinstall Windows', isCorrect: false, feedback: 'A full wipe is a last resort (especially for rootkits), not a first step. You may be able to remediate without data loss.' },
          { id: 'd', text: 'Educate the user about how to avoid malware', isCorrect: false, feedback: 'User education is Step 7 — after the system is clean. You cannot educate before you fix.' },
        ],
      },
      {
        id: 's2',
        prompt: 'Step 2: Before doing anything else on the infected machine, what must you do?',
        choices: [
          { id: 'a', text: 'Update the antivirus definitions', isCorrect: false, feedback: 'Updating AV definitions is important but secondary. The immediate priority is preventing spread.' },
          { id: 'b', text: 'Quarantine the infected system by disconnecting it from the network', isCorrect: true, feedback: 'Correct. Step 2 is quarantine. Disconnect from the network (unplug ethernet, disable Wi-Fi) immediately to prevent the malware from spreading to other machines, exfiltrating data, or receiving additional malicious payloads from a C2 server.' },
          { id: 'c', text: 'Back up all user data to a network share', isCorrect: false, feedback: 'Never copy data to a network share from an infected machine — you risk spreading the malware to the share and every device that accesses it.' },
          { id: 'd', text: 'Reboot the computer in normal mode', isCorrect: false, feedback: 'Rebooting in normal mode allows the malware to continue running and potentially spread before you\'ve isolated it.' },
        ],
      },
      {
        id: 's3',
        prompt: 'Step 3: Now that the system is quarantined, what is the next critical step BEFORE running any scanning tools?',
        choices: [
          { id: 'a', text: 'Disable System Restore to prevent the malware from restoring itself', isCorrect: true, feedback: 'Correct. Step 3 is to disable System Restore. Malware can hide in restore points. If you clean the system but leave restore points intact, malware can use "System Restore" to reinstall itself. Disable it, then re-enable and create a fresh restore point after cleaning.' },
          { id: 'b', text: 'Boot into Safe Mode', isCorrect: false, feedback: 'Booting into Safe Mode is a good technique for running AV scanners (done in Step 4), but disabling System Restore must come first to prevent malware from using restore points to evade removal.' },
          { id: 'c', text: 'Run a full antivirus scan immediately', isCorrect: false, feedback: 'Running AV before disabling System Restore means malware can potentially survive via restore points. Disable System Restore first.' },
          { id: 'd', text: 'Change all user passwords', isCorrect: false, feedback: 'Password changes are important if credentials were compromised, but this is not Step 3 of the formal process. Disable System Restore first.' },
        ],
      },
      {
        id: 's4',
        prompt: 'Step 4: System Restore is disabled. You boot into Safe Mode with Networking to update AV definitions, then run a full scan. The scan finds and quarantines 3 threats. What is your NEXT step?',
        choices: [
          { id: 'a', text: 'Immediately re-enable System Restore and create a new restore point', isCorrect: false, feedback: 'Not yet. After the first scan, you should run at least one more scan with updated signatures to ensure all threats are gone before re-enabling restore.' },
          { id: 'b', text: 'Schedule an additional full scan with updated definitions to confirm complete removal', isCorrect: true, feedback: 'Correct. Step 5 is to schedule a scan and run updated AV/anti-malware. A single scan may not catch everything, especially polymorphic malware. Run a second scanner (e.g., Malwarebytes alongside Windows Defender) with latest definitions to confirm.' },
          { id: 'c', text: 'Restore the machine from backup immediately', isCorrect: false, feedback: 'Restoring from backup is an option if remediation fails, but you should first try to clean the existing installation. Restore from backup could mean hours of lost work if scanning would have worked.' },
          { id: 'd', text: 'Reconnect the machine to the network', isCorrect: false, feedback: 'Never reconnect to the network until you have confirmed the system is clean. A single AV scan finding threats does not mean the system is fully remediated.' },
        ],
      },
      {
        id: 's5',
        prompt: 'The second scan is clean. Step 6: Now what?',
        choices: [
          { id: 'a', text: 'Re-enable System Restore and create a new clean restore point', isCorrect: true, feedback: 'Correct. Step 6 is to re-enable System Restore and create a clean restore point now that the system is confirmed clean. This gives the user a safe recovery point going forward.' },
          { id: 'b', text: 'Reconnect to the network immediately', isCorrect: false, feedback: 'You can reconnect to the network, but first re-enable System Restore to protect the now-clean state.' },
          { id: 'c', text: 'Format the drive as a precaution', isCorrect: false, feedback: 'If two scans show clean, formatting is unnecessary. Formatting is reserved for confirmed rootkit infections or when scanning cannot fully remediate.' },
          { id: 'd', text: 'Educate the user and document the incident', isCorrect: false, feedback: 'Those are Steps 7 and 8, but Step 6 is specifically re-enabling System Restore. Order matters on the exam.' },
        ],
      },
      {
        id: 's6',
        prompt: 'Final Steps 7 & 8: The system is clean and System Restore is re-enabled. What remains?',
        choices: [
          { id: 'a', text: 'Educate the user on avoiding malware, then document the incident in the ticketing system', isCorrect: true, feedback: 'Correct. Step 7: Educate the end user (explain how the infection likely happened — phishing link, drive-by download, etc.). Step 8: Document everything in the ticketing system — symptoms, tools used, threats found, resolution. This creates institutional knowledge.' },
          { id: 'b', text: 'The ticket is resolved — close it without further action', isCorrect: false, feedback: 'Never close without user education and documentation. CompTIA specifically tests these final steps — they prevent future incidents and create accountability.' },
          { id: 'c', text: 'Image the clean machine and deploy the image to all similar workstations', isCorrect: false, feedback: 'Imaging should be done proactively, not reactively after a single infection. The immediate priority is user education and documentation.' },
          { id: 'd', text: 'Install a new AV product since the current one was infected', isCorrect: false, feedback: 'If the AV successfully detected and removed the threats, it functioned correctly. Swapping AV products is not a standard step in the removal process.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'sec-ransomware',
    title: 'Ransomware Response',
    category: 'security',
    difficulty: 3,
    estimatedMinutes: 8,
    objectives: ['2.4', '3.4'],
    examCode: '220-1202',
    summary: 'A workstation has been hit by ransomware. Make the correct incident response decisions.',
    context: `A user calls in a panic: their screen shows a ransom note demanding Bitcoin payment within 72 hours in exchange for a decryption key. All files in the Documents folder are now named with ".locked" extensions. The machine is connected to the office network.`,
    steps: [
      {
        id: 's1',
        prompt: 'This is ransomware. What is your ABSOLUTE FIRST action?',
        choices: [
          { id: 'a', text: 'Pay the ransom to get the decryption key quickly', isCorrect: false, feedback: 'Never pay the ransom. Payment does not guarantee you get a working key, funds criminal operations, and makes you a target for future attacks. FBI and security agencies advise against payment.' },
          { id: 'b', text: 'Immediately disconnect the machine from the network', isCorrect: true, feedback: 'Correct. Ransomware can spread laterally across network shares. Disconnecting immediately (physically unplug ethernet, disable Wi-Fi) limits the blast radius. Every second of network connectivity risks encrypting shared drives and spreading to other machines.' },
          { id: 'c', text: 'Run System Restore to roll back the encryption', isCorrect: false, feedback: 'Most ransomware disables or deletes shadow copies and System Restore. More importantly, you must disconnect from the network before taking any other action.' },
          { id: 'd', text: 'Restart the computer to clear the ransomware from memory', isCorrect: false, feedback: 'Restarting does not help and can make things worse — some ransomware encrypts more files on reboot. Disconnect from the network first.' },
        ],
      },
      {
        id: 's2',
        prompt: 'Machine is disconnected. You check network logs and confirm no lateral movement occurred. What do you do next?',
        choices: [
          { id: 'a', text: 'Attempt to identify the ransomware strain using the ransom note details', isCorrect: true, feedback: 'Correct. Identifying the strain (via the ransom note format, extension used, or tools like ID Ransomware at nomoreransom.org) is critical — some older strains have public decryption keys available for free, eliminating the need to pay or restore from backup.' },
          { id: 'b', text: 'Begin reformatting the drive immediately', isCorrect: false, feedback: 'Reformatting destroys any chance of recovery (including from free decryptor tools). Identify the strain first.' },
          { id: 'c', text: 'Attempt to manually decrypt the files using a hex editor', isCorrect: false, feedback: 'Modern ransomware uses RSA-2048 or AES-256 encryption. Manual decryption without the key is computationally impossible.' },
          { id: 'd', text: 'Reconnect to the network to download decryption tools', isCorrect: false, feedback: 'Never reconnect an infected machine to the network. Use a clean machine to research decryption options.' },
        ],
      },
      {
        id: 's3',
        prompt: 'No free decryptor exists for this strain. The company has clean backups from yesterday. What is the correct recovery path?',
        choices: [
          { id: 'a', text: 'Wipe the drive, reinstall Windows, restore data from backup', isCorrect: true, feedback: 'Correct. When no free decryptor exists and backups are available, the right path is: wipe the drive (ensuring the ransomware is completely removed), reinstall the OS clean, then restore from the last known-good backup. This is faster and safer than attempting incomplete cleanup.' },
          { id: 'b', text: 'Run malware removal tools to clean the ransomware, then use the files as-is', isCorrect: false, feedback: 'Removing the ransomware executable does not decrypt already-encrypted files. The files are still locked even after the malware is removed.' },
          { id: 'c', text: 'Pay the ransom since backups only go to yesterday', isCorrect: false, feedback: 'Paying the ransom is never recommended. Losing one day of data is far preferable to funding criminals and receiving no guarantee of a working key.' },
          { id: 'd', text: 'Keep the machine offline indefinitely and hope a decryptor is released later', isCorrect: false, feedback: 'While decryptors do sometimes become available later, keeping a machine permanently offline is not a business solution. Restore from backup now and monitor nomoreransom.org for future decryptors if the lost data is critical.' },
        ],
      },
      {
        id: 's4',
        prompt: 'After restoring, what TWO things must be done to prevent reinfection? (Choose the BEST answer)',
        choices: [
          { id: 'a', text: 'Identify and close the attack vector (e.g., patch the vulnerability or train the user), and verify backup integrity going forward', isCorrect: true, feedback: 'Correct. You must: (1) Find how the ransomware got in — phishing email, unpatched software, RDP with weak credentials — and close that vector. (2) Verify and test your backup system regularly so you\'re never caught without a clean restore point.' },
          { id: 'b', text: 'Install a more expensive antivirus and change the Wi-Fi password', isCorrect: false, feedback: 'These are generic actions that don\'t address the specific attack vector. If the user was phished, AV changes won\'t help. Identify the actual vector first.' },
          { id: 'c', text: 'Disable all USB ports and email access on the machine', isCorrect: false, feedback: 'Blanket restrictions may prevent legitimate work without addressing the root cause. Find and close the specific vulnerability used.' },
          { id: 'd', text: 'Report the incident to law enforcement and do nothing else', isCorrect: false, feedback: 'Reporting (e.g., to FBI\'s IC3) is good practice but does not protect you from reinfection. You must address the attack vector.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OS TROUBLESHOOTING
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'os-boot-failure',
    title: 'Windows Won\'t Boot',
    category: 'os',
    difficulty: 2,
    estimatedMinutes: 9,
    objectives: ['3.1'],
    examCode: '220-1202',
    summary: 'A Windows machine fails to start after a Windows Update. Use WinRE to diagnose and repair.',
    context: `A user turned on their computer this morning and sees a black screen with the error: "BOOTMGR is missing. Press Ctrl+Alt+Del to restart." Pressing the keys just loops back to the same error. The machine was working fine before they installed Windows updates last night.`,
    steps: [
      {
        id: 's1',
        prompt: '"BOOTMGR is missing" — what does this mean, and what is your first step?',
        choices: [
          { id: 'a', text: 'The hard drive has failed and needs replacement', isCorrect: false, feedback: 'A completely failed drive would show different errors (or no boot attempt at all). "BOOTMGR is missing" specifically means the boot manager file is corrupt or inaccessible — the drive itself is likely fine.' },
          { id: 'b', text: 'The Windows Boot Manager (bootmgr) is corrupt or missing. Boot from Windows installation media to access WinRE.', isCorrect: true, feedback: 'Correct. BOOTMGR is the Windows Boot Manager — a file in the system partition. It can be corrupted by failed updates, bad sectors, or accidental deletion. The fix is to boot from Windows USB/DVD media and use the Windows Recovery Environment (WinRE) repair tools.' },
          { id: 'c', text: 'The BIOS needs to be reset to factory defaults', isCorrect: false, feedback: 'A BIOS reset would not fix a corrupt bootmgr file. The BIOS is working fine — it\'s posting and looking for a bootable OS.' },
          { id: 'd', text: 'Windows needs to be reinstalled completely', isCorrect: false, feedback: 'A full reinstall is premature. WinRE\'s Startup Repair often fixes bootmgr issues automatically in minutes without affecting user data.' },
        ],
      },
      {
        id: 's2',
        prompt: 'You boot from Windows 11 USB media. You see the Windows Setup screen. Where do you navigate to access repair tools?',
        choices: [
          { id: 'a', text: 'Click "Install Now" to begin a Windows reinstall', isCorrect: false, feedback: '"Install Now" starts a fresh installation which may overwrite data. You want the repair tools, not a reinstall.' },
          { id: 'b', text: 'Click "Repair your computer" in the bottom-left corner', isCorrect: true, feedback: 'Correct. "Repair your computer" launches the Windows Recovery Environment (WinRE) with non-destructive repair tools including Startup Repair, System Restore, Command Prompt, and more.' },
          { id: 'c', text: 'Press Shift+F10 to open a command prompt directly', isCorrect: false, feedback: 'Shift+F10 opens a command prompt, which is useful, but navigating through the GUI to "Repair your computer" first gives you access to all recovery tools including the automated Startup Repair.' },
          { id: 'd', text: 'Press F8 to access Safe Mode', isCorrect: false, feedback: 'F8 (legacy boot menu) doesn\'t apply here — you\'re booting from external USB media. F8 would only work during a normal boot sequence.' },
        ],
      },
      {
        id: 's3',
        prompt: 'You\'re in WinRE. You run "Startup Repair" but it fails to fix the issue automatically. You open the Command Prompt. Which command rebuilds the Boot Configuration Data (BCD)?',
        toolOutput: {
          label: 'WinRE Command Prompt',
          content: `X:\\Sources> _`,
        },
        choices: [
          { id: 'a', text: 'sfc /scannow', isCorrect: false, feedback: 'sfc /scannow scans Windows system files for corruption. It does not rebuild the BCD or fix bootmgr. It\'s useful for OS file corruption, not boot issues.' },
          { id: 'b', text: 'bootrec /rebuildbcd', isCorrect: true, feedback: 'Correct. The bootrec.exe tool is specifically for fixing Windows boot issues. /rebuildbcd scans for Windows installations and lets you add them to the BCD store. The full sequence is often: bootrec /fixmbr → bootrec /fixboot → bootrec /rebuildbcd.' },
          { id: 'c', text: 'diskpart', isCorrect: false, feedback: 'diskpart is for disk partitioning. It\'s a component of the fix (you might use it to set a partition as active) but not the primary command to fix bootmgr.' },
          { id: 'd', text: 'chkdsk C: /f /r', isCorrect: false, feedback: 'chkdsk checks disk integrity. It can fix file system errors that might be related, but it is not the right tool for rebuilding the BCD store.' },
        ],
      },
      {
        id: 's4',
        prompt: 'bootrec /rebuildbcd ran successfully and found one Windows installation. You restart — and Windows boots normally! What should you do now?',
        choices: [
          { id: 'a', text: 'Nothing — if it boots, the issue is resolved', isCorrect: false, feedback: 'You should verify that the update that triggered the issue completed properly, and document the incident.' },
          { id: 'b', text: 'Immediately wipe the drive as a precaution', isCorrect: false, feedback: 'The system is working. There is no reason for a destructive action. The BCD was simply corrupted during the update.' },
          { id: 'c', text: 'Check Windows Update status, verify the user\'s data is intact, create a restore point, and document the resolution', isCorrect: true, feedback: 'Correct. Verify the update installed correctly (check Windows Update history for errors), confirm all user data and applications are intact, create a fresh System Restore point, and document the issue and fix for the knowledge base.' },
          { id: 'd', text: 'Rollback the Windows Update that caused the problem', isCorrect: false, feedback: 'Rolling back is an option if the update is definitively problematic, but the boot issue was caused by a corrupted BCD during installation, not by the update content itself. Verify it completed first.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'os-slow-pc',
    title: 'Diagnosing a Slow Computer',
    category: 'os',
    difficulty: 1,
    estimatedMinutes: 7,
    objectives: ['3.1', '1.4'],
    examCode: '220-1202',
    summary: 'A user\'s computer is running much slower than usual. Systematically identify and fix the cause.',
    context: `A user complains their Windows 11 computer has become very slow over the past week. "Everything takes forever to open, and sometimes the computer freezes for 10-15 seconds." No new software was installed recently.`,
    steps: [
      {
        id: 's1',
        prompt: 'What Windows tool gives you the FASTEST overview of what is currently consuming CPU, memory, and disk resources?',
        choices: [
          { id: 'a', text: 'Device Manager', isCorrect: false, feedback: 'Device Manager shows hardware and drivers, not real-time resource usage. It won\'t help diagnose a slowness issue.' },
          { id: 'b', text: 'Task Manager (Ctrl+Shift+Esc)', isCorrect: true, feedback: 'Correct. Task Manager\'s Performance and Processes tabs give you an immediate view of CPU, memory, disk, and network utilization, plus which processes are consuming the most resources. It\'s the first tool to open for performance issues.' },
          { id: 'c', text: 'Registry Editor (regedit)', isCorrect: false, feedback: 'The Registry contains system configuration, not real-time performance data. It\'s not the right tool for this initial triage.' },
          { id: 'd', text: 'Event Viewer', isCorrect: false, feedback: 'Event Viewer is useful for checking error logs — a good second step — but Task Manager gives you live resource data faster.' },
        ],
      },
      {
        id: 's2',
        prompt: 'Task Manager shows the data below. What is the most likely cause of the slowness?',
        toolOutput: {
          label: 'Task Manager — Performance tab',
          content: `CPU:       8%  (normal)
Memory:   67%  (normal, 10.7 GB of 16 GB)
Disk 0:   98%  (C: — HDD)
Network:  <1%  (normal)`,
        },
        choices: [
          { id: 'a', text: 'Insufficient RAM — memory is at 67%', isCorrect: false, feedback: '67% memory utilization is normal for Windows 11 with typical applications open. This is not the problem.' },
          { id: 'b', text: 'The HDD is at 100% utilization, creating a severe bottleneck', isCorrect: true, feedback: 'Correct. 98-100% disk utilization on a traditional HDD is the classic cause of Windows 10/11 freezing. HDDs are mechanical and cannot handle the random I/O demands of modern OS operations. This bottleneck causes everything that touches disk to queue up — hence the 10-15 second freezes.' },
          { id: 'c', text: 'The CPU is overheating and throttling', isCorrect: false, feedback: 'At 8% CPU usage there is no load that would cause thermal throttling. The disk is the bottleneck.' },
          { id: 'd', text: 'The network adapter is causing interrupts', isCorrect: false, feedback: 'Network utilization is near 0% and there is no indication of network issues. The disk bottleneck is clearly the problem.' },
        ],
      },
      {
        id: 's3',
        prompt: 'The disk is at 100%. What should you check FIRST to find what is hammering the disk?',
        choices: [
          { id: 'a', text: 'Click the Disk column in Task Manager\'s Processes tab to see which process is causing the I/O', isCorrect: true, feedback: 'Correct. Sorting by Disk in the Processes tab immediately reveals the culprit — it\'s often Windows Update downloading/installing, antivirus scanning, or a background indexing service. Identifying the process tells you whether to wait (update) or act (malware, bad service).' },
          { id: 'b', text: 'Immediately run chkdsk to check for disk errors', isCorrect: false, feedback: 'chkdsk is for file system/sector errors, not for identifying which process is using the disk. Check the process first — chkdsk would be a subsequent step if disk health is suspected.' },
          { id: 'c', text: 'Run Disk Cleanup to free up space', isCorrect: false, feedback: 'Disk Cleanup removes unnecessary files but does not address active I/O utilization. A drive with plenty of free space can still be at 100% I/O.' },
          { id: 'd', text: 'Defragment the hard drive', isCorrect: false, feedback: 'Defragmentation can improve HDD performance, but running it while the disk is at 100% would make things worse. Identify the cause first.' },
        ],
      },
      {
        id: 's4',
        prompt: 'The disk I/O is caused by Windows Search indexing and Superfetch (SysMain). These are legitimate Windows services. What is the BEST long-term solution?',
        choices: [
          { id: 'a', text: 'Disable Windows Search and SysMain permanently', isCorrect: false, feedback: 'Disabling these services improves HDD performance but removes features (search indexing) and memory prefetching. It\'s a workaround, not the root fix. The root issue is the HDD.' },
          { id: 'b', text: 'Replace the HDD with an SSD', isCorrect: true, feedback: 'Correct. An SSD is 10-100x faster on random I/O than an HDD. The same Windows background services that cripple an HDD are imperceptible on an SSD. This is the definitive, long-term fix for this class of problem.' },
          { id: 'c', text: 'Add more RAM to reduce disk paging', isCorrect: false, feedback: 'Adding RAM can reduce page file usage, but with 67% utilization already, RAM is not the bottleneck. The disk hardware itself is the constraint.' },
          { id: 'd', text: 'Reinstall Windows to start fresh', isCorrect: false, feedback: 'A clean reinstall would temporarily feel faster (fewer background processes), but the HDD bottleneck would return quickly as Windows rebuilds its indexes and cache.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // HARDWARE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'hw-post-failure',
    title: 'POST Failure Diagnosis',
    category: 'hardware',
    difficulty: 2,
    estimatedMinutes: 8,
    objectives: ['5.1'],
    examCode: '220-1201',
    summary: 'A desktop PC powers on but gives no video output and beeps. Identify the failing component.',
    context: `A desktop PC is brought to you for repair. When powered on, the case fans spin and the power LED lights up — but there is no video output, no POST screen, and the system emits a series of beeps before halting. The BIOS is AMI.`,
    steps: [
      {
        id: 's1',
        prompt: 'The system beeps during POST. What do these beeps represent?',
        choices: [
          { id: 'a', text: 'Beep codes are POST diagnostic signals — the pattern indicates which component failed', isCorrect: true, feedback: 'Correct. Beep codes are the BIOS\'s way of communicating POST failures when it cannot output video. Different patterns mean different failures (e.g., 3 beeps = RAM failure in AMI BIOS). The pattern must be matched against the BIOS manufacturer\'s reference table.' },
          { id: 'b', text: 'Beep codes mean the CPU fan is not spinning properly', isCorrect: false, feedback: 'Beep codes communicate a wide range of POST failures. While a CPU fan error can trigger specific beeps, the specific pattern must be looked up — don\'t assume.' },
          { id: 'c', text: 'The computer is working normally — one beep is always good', isCorrect: false, feedback: 'Correct: one short beep in AMI/Award BIOS means POST passed. Multiple beeps or specific patterns indicate failures. This system is NOT completing POST.' },
          { id: 'd', text: 'Beep codes are obsolete and can be ignored on modern systems', isCorrect: false, feedback: 'Beep codes are still used on modern motherboards, though POST codes (displayed on a 2-digit LED panel on high-end boards) are increasingly common alongside them.' },
        ],
      },
      {
        id: 's2',
        prompt: 'You count the beep pattern: 3 long beeps. In AMI BIOS, 3 beeps indicate what?',
        choices: [
          { id: 'a', text: 'RAM failure — memory not detected or failed memory test', isCorrect: true, feedback: 'Correct. In AMI BIOS, 3 beeps indicate a RAM (base memory) failure. This is one of the most testable beep codes on the CompTIA A+ exam. Common causes: seated RAM, failed module, incompatible RAM, or a slot issue.' },
          { id: 'b', text: 'CPU failure — processor not detected', isCorrect: false, feedback: 'AMI BIOS CPU errors typically show as 5 beeps (CPU failure) or other specific patterns. 3 beeps = RAM in AMI. Know the common patterns: 1 short = POST OK, 1 long + 2 short = video failure, 3 = RAM.' },
          { id: 'c', text: 'Power supply failure — insufficient voltage', isCorrect: false, feedback: 'PSU failures don\'t always produce specific beep codes — the system might not post at all. 3 beeps specifically points to RAM in AMI BIOS.' },
          { id: 'd', text: 'Keyboard not detected', isCorrect: false, feedback: 'Keyboard errors produce different beep codes. 3 beeps in AMI = RAM failure.' },
        ],
      },
      {
        id: 's3',
        prompt: 'Diagnosis: RAM failure. Before replacing the RAM, what should you try first?',
        choices: [
          { id: 'a', text: 'Remove and firmly reseat the RAM modules in their slots', isCorrect: true, feedback: 'Correct. Unseated or oxidized RAM is the most common cause of RAM-related POST failures. Remove each stick, clean the contacts with a pencil eraser, and firmly reseat. This is the free, non-destructive first step before any hardware replacement.' },
          { id: 'b', text: 'Replace all RAM modules immediately', isCorrect: false, feedback: 'Don\'t spend money on new hardware before trying free fixes first. Reseating takes 2 minutes and fixes the majority of RAM POST failures.' },
          { id: 'c', text: 'Flash the BIOS to the latest firmware', isCorrect: false, feedback: 'You cannot flash the BIOS when POST is failing. And a BIOS update would not fix a hardware RAM issue. Reseat first.' },
          { id: 'd', text: 'Reset CMOS by removing the battery', isCorrect: false, feedback: 'CMOS reset clears BIOS settings but does not fix RAM hardware issues. It\'s useful for BIOS configuration problems, not POST hardware failures.' },
        ],
      },
      {
        id: 's4',
        prompt: 'Reseating didn\'t help. You test each stick individually in the first slot. Stick #2 causes the 3-beep failure alone; Stick #1 boots fine. What is your conclusion and next action?',
        choices: [
          { id: 'a', text: 'RAM Stick #2 is faulty — replace it', isCorrect: true, feedback: 'Correct. By testing each stick individually, you\'ve isolated the failure to a specific module. Stick #2 is defective. Replace it with a compatible module (matching speed, type, and capacity). This is the diagnostic isolation method: test one variable at a time.' },
          { id: 'b', text: 'The RAM slot is faulty — replace the motherboard', isCorrect: false, feedback: 'If the slot were faulty, Stick #1 would also fail in that slot. Since Stick #1 works in the same slot, the slot is fine. The module itself is defective.' },
          { id: 'c', text: 'Both sticks are fine — the problem is elsewhere', isCorrect: false, feedback: 'You reproduced the failure with Stick #2 in isolation. It is definitively the failing component.' },
          { id: 'd', text: 'Replace both sticks to ensure matched pair performance', isCorrect: false, feedback: 'Replacing working hardware unnecessarily wastes money. Only replace the confirmed faulty module (Stick #2). If dual-channel performance is needed, replace with a matched kit.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'hw-printer-offline',
    title: 'Printer Shows Offline',
    category: 'hardware',
    difficulty: 1,
    estimatedMinutes: 6,
    objectives: ['5.6', '3.7'],
    examCode: '220-1201',
    summary: 'A network printer shows "Offline" in Windows. Diagnose and resolve the issue systematically.',
    context: `A user calls in: "I need to print an urgent document but my printer just shows Offline. I haven't changed anything." The printer is a network laser printer shared across the office. Other users are reporting the same issue.`,
    steps: [
      {
        id: 's1',
        prompt: 'Multiple users are affected. What does this immediately tell you about where the problem is?',
        choices: [
          { id: 'a', text: 'It\'s a Windows driver issue on all the users\' computers', isCorrect: false, feedback: 'A driver issue would typically affect one machine. Multiple users experiencing the same problem simultaneously points to the shared resource — the printer or network — not individual machines.' },
          { id: 'b', text: 'The problem is with the printer itself or the network path to it — not individual computers', isCorrect: true, feedback: 'Correct. When multiple users are simultaneously affected, the common component is the shared resource. Check the printer hardware/status and network connectivity first, before looking at any individual computer.' },
          { id: 'c', text: 'A virus has disabled printing on all computers', isCorrect: false, feedback: 'While theoretically possible, this is extremely unlikely compared to the printer simply being offline, out of paper, or having a network issue. Always check the simplest cause first.' },
          { id: 'd', text: 'Windows Update must have broken the print spooler', isCorrect: false, feedback: 'A print spooler issue on one machine would not affect other machines. And multiple machines being affected at the same time by unrelated spooler issues is implausible.' },
        ],
      },
      {
        id: 's2',
        prompt: 'You walk to the printer. The control panel shows an error light and the display reads "Paper Jam — Clear All Jams." What is the correct procedure?',
        choices: [
          { id: 'a', text: 'Power cycle the printer without clearing the jam to reset the error', isCorrect: false, feedback: 'Power cycling without clearing the jam will just regenerate the same error on boot. The jam must be physically cleared first.' },
          { id: 'b', text: 'Open all access panels, remove jammed paper by pulling in the direction of paper travel, then clear the error', isCorrect: true, feedback: 'Correct. Always pull jammed paper in the direction of paper travel (forward through the printer, never backward) to avoid tearing paper into small pieces that are harder to remove. Open all access panels — many jams have paper fragments in secondary trays. Clear the error from the panel after.' },
          { id: 'c', text: 'Rip the jammed paper out quickly regardless of direction', isCorrect: false, feedback: 'Pulling paper against the paper path can tear it, leaving fragments inside the printer that cause further jams or damage the fuser.' },
          { id: 'd', text: 'Call the manufacturer\'s support line immediately', isCorrect: false, feedback: 'A paper jam is a routine maintenance item. Clear it yourself following the on-screen or manual instructions before escalating to a vendor.' },
        ],
      },
      {
        id: 's3',
        prompt: 'Jam cleared, printer back online physically. But users still see the printer as "Offline" in Windows. What is the next step?',
        choices: [
          { id: 'a', text: 'Restart the Print Spooler service on the affected computers', isCorrect: false, feedback: 'The print spooler manages print queues. While a stuck spooler is sometimes the issue, the more likely cause is stale job data or a disconnect — restarting the spooler is worth trying if pinging the printer works, but check connectivity first.' },
          { id: 'b', text: 'Ping the printer\'s IP address to confirm network connectivity is restored', isCorrect: true, feedback: 'Correct. Confirm the printer is reachable on the network first. If ping fails, the issue is network (check if the printer got a new IP via DHCP). If ping succeeds, the issue is Windows\'s printer status — right-click the printer and select "See what\'s printing" → "Printer" menu → uncheck "Use Printer Offline".' },
          { id: 'c', text: 'Uninstall and reinstall the printer driver on all computers', isCorrect: false, feedback: 'Driver reinstall on every computer is time-consuming and not necessary if the printer was working before. Verify connectivity and Windows printer status first.' },
          { id: 'd', text: 'Restart all users\' computers', isCorrect: false, feedback: 'Restarting computers is disruptive and not necessary for a printer connectivity issue. Target the actual cause.' },
        ],
      },
      {
        id: 's4',
        prompt: 'Ping succeeds but the printer still shows "Offline" in Windows on one remaining computer. What setting should you check?',
        choices: [
          { id: 'a', text: 'Uncheck "Use Printer Offline" in the Printer menu of the print queue window', isCorrect: true, feedback: 'Correct. Windows can get stuck in "Use Printer Offline" mode. Go to: Control Panel → Devices and Printers → right-click printer → "See what\'s printing" → "Printer" menu → uncheck "Use Printer Offline." This is a common A+ exam scenario.' },
          { id: 'b', text: 'Delete and re-add the printer', isCorrect: false, feedback: 'This would work but is more effort than necessary. The "Use Printer Offline" setting fix is a one-click solution.' },
          { id: 'c', text: 'Check if the printer is set to the correct paper size', isCorrect: false, feedback: 'Paper size settings affect print output, not online/offline status.' },
          { id: 'd', text: 'Reinstall the operating system', isCorrect: false, feedback: 'A single checkbox misconfiguration does not warrant an OS reinstall.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'mob-battery-drain',
    title: 'Excessive Mobile Battery Drain',
    category: 'mobile',
    difficulty: 1,
    estimatedMinutes: 6,
    objectives: ['5.4'],
    examCode: '220-1201',
    summary: 'A user\'s smartphone battery is draining significantly faster than usual. Systematically identify the cause.',
    context: `A user reports their Android phone used to last all day but now dies by early afternoon — the same usage patterns as before. The phone is about 2 years old. No new apps were installed recently, but the OS updated itself 3 days ago.`,
    steps: [
      {
        id: 's1',
        prompt: 'What tool should you check FIRST to identify what is causing abnormal battery drain?',
        choices: [
          { id: 'a', text: 'Settings → Battery → Battery usage (shows per-app consumption)', isCorrect: true, feedback: 'Correct. Both Android and iOS have built-in battery usage screens that show exactly which apps and system processes are consuming power. This is always the first step — identify the specific cause before taking any action.' },
          { id: 'b', text: 'Immediately factory reset the phone', isCorrect: false, feedback: 'Factory reset is a last resort that erases all data. You haven\'t even identified the cause yet.' },
          { id: 'c', text: 'Replace the battery immediately', isCorrect: false, feedback: 'Battery replacement might be needed eventually (the phone is 2 years old), but first identify whether the problem is software (runaway app) or hardware (degraded battery).' },
          { id: 'd', text: 'Disable Wi-Fi and Bluetooth to conserve power', isCorrect: false, feedback: 'This is a workaround that limits functionality, not a diagnosis. Find the actual cause first.' },
        ],
      },
      {
        id: 's2',
        prompt: 'Battery usage shows "Android System: 45% (since last full charge)." This is much higher than normal. What is the most likely cause given the recent OS update?',
        choices: [
          { id: 'a', text: 'The OS update triggered background optimization processes that are still running', isCorrect: true, feedback: 'Correct. After an OS update, Android typically runs background tasks: re-optimizing all app binaries (dex2oat), reindexing media, and other housekeeping. These are legitimate, temporary processes. If they don\'t complete within a day, a restart usually triggers them to finish.' },
          { id: 'b', text: 'The OS update installed malware', isCorrect: false, feedback: 'Official OS updates from device manufacturers are signed and verified. Malware in an official OTA update is essentially unheard of. The background optimization is the far more likely explanation.' },
          { id: 'c', text: 'The battery has failed and needs immediate replacement', isCorrect: false, feedback: 'A failed battery would show different symptoms (sudden shutdown at 20-30%, swelling). Abnormal system-level drain following an update is a software/optimization issue.' },
          { id: 'd', text: 'Location services are stuck in a loop', isCorrect: false, feedback: 'Location services would appear as a separate entry in battery usage, and the drain would show under Google or specific apps. "Android System" at 45% points to OS-level optimization tasks.' },
        ],
      },
      {
        id: 's3',
        prompt: 'It\'s been 5 days since the update and drain is still abnormal. The phone hasn\'t been restarted since the update. What should you try next?',
        choices: [
          { id: 'a', text: 'Restart the phone to trigger completion of any stuck background tasks', isCorrect: true, feedback: 'Correct. A restart after a major update flushes RAM, kills stuck background processes, and often triggers the OS optimization tasks to complete properly. This is always the next step before more invasive troubleshooting.' },
          { id: 'b', text: 'Roll back the OS update', isCorrect: false, feedback: 'OS rollbacks are rarely possible on Android without unlocking the bootloader. More importantly, a restart should be tried first — it often resolves post-update optimization issues.' },
          { id: 'c', text: 'Install a third-party battery optimizer app', isCorrect: false, feedback: 'Third-party battery optimizer apps often make things worse by adding their own background processes. The OS\'s own tools are more reliable.' },
          { id: 'd', text: 'Disable automatic updates to prevent this in the future', isCorrect: false, feedback: 'Disabling updates leaves the device vulnerable to security exploits. Address the current issue first; don\'t compromise security to avoid inconvenience.' },
        ],
      },
      {
        id: 's4',
        prompt: 'After restart, battery still drains in half the expected time. You check battery health (Settings → Battery → Battery health) and see "78% maximum capacity." What does this mean?',
        choices: [
          { id: 'a', text: 'Battery health is fine — 78% is within normal range', isCorrect: false, feedback: 'Below 80% maximum capacity is generally considered degraded. At 78%, the battery can only hold 78% of its original charge — that directly explains why the phone dies earlier than expected.' },
          { id: 'b', text: 'The battery has naturally degraded and holds only 78% of its original capacity — replacement is recommended', isCorrect: true, feedback: 'Correct. Lithium-ion batteries degrade with charge cycles. After 2 years of daily use, 78% capacity is expected. Apple recommends replacement below 80%; similar guidance applies to Android. The physical battery chemistry has degraded and software fixes won\'t help. Battery replacement is the solution.' },
          { id: 'c', text: 'The phone needs a factory reset to recalibrate the battery percentage', isCorrect: false, feedback: 'Factory reset affects software, not battery chemistry. The capacity reading reflects the actual physical state of the battery cells — software cannot restore degraded lithium-ion capacity.' },
          { id: 'd', text: 'Draining the battery to 0% and fully recharging will restore capacity', isCorrect: false, feedback: 'This is a common myth from the NiCd battery era. Lithium-ion batteries should never be fully drained — doing so accelerates degradation. Calibration procedures do not restore capacity.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'sec-soho-hardening',
    title: 'SOHO Router Security Setup',
    category: 'security',
    difficulty: 2,
    estimatedMinutes: 8,
    objectives: ['2.10', '2.6'],
    examCode: '220-1202',
    summary: 'Walk through hardening a new home router following security best practices.',
    context: `A small business owner just got a new SOHO router from their ISP. It's running with default factory settings. They ask you to secure it before connecting any devices. Walk through the hardening process in the correct order.`,
    steps: [
      {
        id: 's1',
        prompt: 'What is the FIRST thing you should do when setting up a new router?',
        choices: [
          { id: 'a', text: 'Change the default admin username and password', isCorrect: true, feedback: 'Correct. Default credentials (admin/admin, admin/password) are publicly known and are the #1 cause of router compromise. This must be the very first step — every other configuration is meaningless if an attacker can log in with defaults.' },
          { id: 'b', text: 'Set up the Wi-Fi SSID and password', isCorrect: false, feedback: 'SSID/password setup is important, but if you leave default admin credentials, an attacker can change your Wi-Fi password (and everything else) after you configure it.' },
          { id: 'c', text: 'Enable WPA3 encryption', isCorrect: false, feedback: 'Important, but not the first step. Changing default credentials takes priority — without that, all other settings can be undone.' },
          { id: 'd', text: 'Update the router firmware', isCorrect: false, feedback: 'Firmware updates are important (second or third step), but changing default credentials comes first to prevent unauthorized access during the setup process.' },
        ],
      },
      {
        id: 's2',
        prompt: 'Admin credentials changed. What should you do next?',
        choices: [
          { id: 'a', text: 'Check for and install firmware updates', isCorrect: true, feedback: 'Correct. Firmware updates patch known security vulnerabilities. An unpatched router can be compromised even with changed credentials. Check the manufacturer\'s site or the router\'s built-in update feature before any other configuration.' },
          { id: 'b', text: 'Set up port forwarding for remote access', isCorrect: false, feedback: 'Port forwarding opens holes in the firewall and should only be configured when specifically needed and after basic security is established.' },
          { id: 'c', text: 'Disable the DHCP server', isCorrect: false, feedback: 'Disabling DHCP would require all devices to use static IPs — unnecessary complexity with no security benefit in a SOHO environment.' },
          { id: 'd', text: 'Set up a DMZ for all devices', isCorrect: false, feedback: 'A DMZ removes firewall protection from devices placed in it — the opposite of what you want during hardening.' },
        ],
      },
      {
        id: 's3',
        prompt: 'Firmware is updated. Now configure Wi-Fi security. Which setting combination is correct?',
        choices: [
          { id: 'a', text: 'WPA3 Personal (or WPA2/WPA3 transition mode) with AES encryption and a strong passphrase', isCorrect: true, feedback: 'Correct. WPA3-Personal (with SAE) is the current standard. Use WPA2/WPA3 transition mode for compatibility with older devices. AES (CCMP) is the required encryption cipher — never TKIP. Use a passphrase of 12+ random characters.' },
          { id: 'b', text: 'WEP with a 128-bit key for maximum compatibility', isCorrect: false, feedback: 'WEP was cracked in the early 2000s and can be broken in minutes. It provides no meaningful security. Never use WEP.' },
          { id: 'c', text: 'WPA2 with TKIP for compatibility with all devices', isCorrect: false, feedback: 'TKIP (used in original WPA and optional in WPA2) has known vulnerabilities and is deprecated. Always use AES/CCMP with WPA2 or WPA3.' },
          { id: 'd', text: 'Open network (no password) — use MAC filtering for security instead', isCorrect: false, feedback: 'An open network transmits all data unencrypted. MAC filtering is trivially bypassed by spoofing a legitimate MAC address. Never use an open network for a business.' },
        ],
      },
      {
        id: 's4',
        prompt: 'The owner wants to set up a separate network for guest customers. What is the correct approach?',
        choices: [
          { id: 'a', text: 'Enable the router\'s Guest Network feature with its own SSID and password, isolated from the main LAN', isCorrect: true, feedback: 'Correct. A guest network is a separate VLAN/SSID that provides internet access without exposing the main business network. Guests cannot see or access business computers, NAS drives, or printers. This is the standard approach for SOHO environments.' },
          { id: 'b', text: 'Share the main Wi-Fi password with guests', isCorrect: false, feedback: 'Giving guests access to the main network means they can potentially see and attack business devices. A separate guest network is always safer.' },
          { id: 'c', text: 'Set up a separate router for guests on a different ISP connection', isCorrect: false, feedback: 'This is unnecessary cost and complexity. The guest network feature built into most routers achieves the same isolation.' },
          { id: 'd', text: 'Use MAC filtering to control who can connect', isCorrect: false, feedback: 'MAC filtering is easily bypassed by scanning the air for allowed MAC addresses and spoofing one. It is not a security control — it\'s only an inconvenience.' },
        ],
      },
      {
        id: 's5',
        prompt: 'Final step: The router has WPS (Wi-Fi Protected Setup) enabled by default. What should you do?',
        choices: [
          { id: 'a', text: 'Disable WPS immediately', isCorrect: true, feedback: 'Correct. WPS has a critical vulnerability (the Pixie Dust attack and brute-force PIN attack) where the 8-digit PIN can be cracked in hours, bypassing your WPA3 password entirely. WPS provides minimal convenience benefit and is a significant security risk. Always disable it.' },
          { id: 'b', text: 'Leave WPS enabled — it\'s safe if you use WPA3', isCorrect: false, feedback: 'WPS vulnerabilities exist independently of WPA2/WPA3. The WPS PIN attack bypasses the Wi-Fi passphrase entirely. Encryption type does not protect against WPS attacks.' },
          { id: 'c', text: 'Use WPS Push Button mode only — the PIN mode is the vulnerable one', isCorrect: false, feedback: 'While PIN mode is more vulnerable, push-button mode also has weaknesses. CompTIA\'s recommendation is to disable WPS entirely.' },
          { id: 'd', text: 'Change the WPS PIN to something complex', isCorrect: false, feedback: 'The vulnerability is in the WPS protocol itself (the 8-digit PIN is checked in two halves of 4 digits each, reducing combinations from 100M to ~11,000). Changing the PIN does not fix the protocol flaw.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INTERACTIVE: DRAG & DROP MATCH — Ports to Protocols
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'net-ports-drag',
    title: 'Match Protocols to Port Numbers',
    category: 'networking',
    difficulty: 1,
    estimatedMinutes: 5,
    objectives: ['2.1'],
    examCode: '220-1201',
    summary: 'Drag each protocol name to its correct well-known port number — a classic CompTIA exam PBQ.',
    context: `Port numbers are fundamental to networking. The CompTIA A+ exam tests your ability to match protocols to their well-known ports without looking them up. Drag each protocol to its correct port.`,
    steps: [
      {
        type: 'drag_match',
        id: 's1',
        prompt: 'Match each protocol to its well-known port number.',
        items: [
          { id: 'http',   label: 'HTTP' },
          { id: 'https',  label: 'HTTPS' },
          { id: 'ssh',    label: 'SSH' },
          { id: 'dns',    label: 'DNS' },
          { id: 'smtp',   label: 'SMTP' },
          { id: 'rdp',    label: 'RDP' },
        ],
        targets: [
          { id: 'p80',   label: 'Port 80',   correctItemId: 'http' },
          { id: 'p443',  label: 'Port 443',  correctItemId: 'https' },
          { id: 'p22',   label: 'Port 22',   correctItemId: 'ssh' },
          { id: 'p53',   label: 'Port 53',   correctItemId: 'dns' },
          { id: 'p25',   label: 'Port 25',   correctItemId: 'smtp' },
          { id: 'p3389', label: 'Port 3389', correctItemId: 'rdp' },
        ],
        feedback: {
          correct: 'Perfect! Knowing these ports cold is essential for the A+ exam and real-world troubleshooting. HTTP=80, HTTPS=443, SSH=22, DNS=53, SMTP=25, RDP=3389.',
          incorrect: 'Some ports are wrong. Remember: HTTP=80, HTTPS=443 (HTTP + Security), SSH=22, DNS=53, SMTP=25, RDP=3389 (Remote Desktop Protocol).',
        },
        hint: 'HTTPS is just HTTP with SSL/TLS added — it uses the next "round" port above 80. SSH replaced Telnet on port 22 as the secure alternative.',
      } as PBQStepDragMatch,
      {
        type: 'drag_match',
        id: 's2',
        prompt: 'Now match these additional protocols to their ports.',
        items: [
          { id: 'ftp',    label: 'FTP' },
          { id: 'ftps',   label: 'FTPS' },
          { id: 'sftp',   label: 'SFTP' },
          { id: 'telnet', label: 'Telnet' },
          { id: 'pop3',   label: 'POP3' },
          { id: 'imap',   label: 'IMAP' },
        ],
        targets: [
          { id: 'p21',  label: 'Port 21',  correctItemId: 'ftp' },
          { id: 'p990', label: 'Port 990', correctItemId: 'ftps' },
          { id: 'p22b', label: 'Port 22',  correctItemId: 'sftp' },
          { id: 'p23',  label: 'Port 23',  correctItemId: 'telnet' },
          { id: 'p110', label: 'Port 110', correctItemId: 'pop3' },
          { id: 'p143', label: 'Port 143', correctItemId: 'imap' },
        ],
        feedback: {
          correct: 'Excellent! FTP=21 (data on 20), FTPS=990, SFTP=22 (runs over SSH), Telnet=23, POP3=110, IMAP=143. SFTP is not the same as FTPS — SFTP is FTP over SSH.',
          incorrect: 'Key trick: SFTP runs over SSH so it shares port 22. FTPS is FTP with SSL and uses port 990. FTP itself uses port 21 (control) and 20 (data).',
        },
        hint: 'SFTP ≠ FTPS. SFTP = FTP over SSH (port 22). FTPS = FTP + SSL/TLS (port 990).',
      } as PBQStepDragMatch,
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INTERACTIVE: DRAG & DROP ORDER — Troubleshooting Methodology
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'os-troubleshooting-order',
    title: 'Order the Troubleshooting Steps',
    category: 'os',
    difficulty: 1,
    estimatedMinutes: 4,
    objectives: ['5.1'],
    examCode: 'both',
    summary: 'Drag CompTIA\'s 6-step troubleshooting methodology into the correct order — tested on both A+ exams.',
    context: `CompTIA defines a specific 6-step troubleshooting methodology that appears on both the Core 1 and Core 2 exams. You must know the exact order. Rearrange the steps into the correct sequence.`,
    steps: [
      {
        type: 'drag_order',
        id: 's1',
        prompt: 'Place CompTIA\'s 6-step troubleshooting methodology in the correct order (1 = first, 6 = last).',
        items: [
          { id: 'establish',   label: 'Establish a theory of probable cause' },
          { id: 'identify',    label: 'Identify the problem' },
          { id: 'verify',      label: 'Verify full system functionality and implement preventive measures' },
          { id: 'test',        label: 'Test the theory to determine the cause' },
          { id: 'plan',        label: 'Establish a plan of action to resolve the problem and implement the solution' },
          { id: 'document',    label: 'Document findings, actions, and outcomes' },
        ],
        correctOrder: ['identify', 'establish', 'test', 'plan', 'verify', 'document'],
        feedback: {
          correct: 'Correct order! 1) Identify the problem → 2) Establish a theory → 3) Test the theory → 4) Plan & implement solution → 5) Verify full functionality → 6) Document everything. This is memorized exactly as-is for the exam.',
          incorrect: 'Not quite. The correct order: 1) Identify → 2) Theory → 3) Test → 4) Plan & Implement → 5) Verify → 6) Document. Note that "Document" is always last, and "Identify" is always first.',
        },
        hint: 'Remember: you must IDENTIFY before you THEORIZE, TEST before you IMPLEMENT, and DOCUMENT last.',
      } as PBQStepDragOrder,
      {
        type: 'drag_order',
        id: 's2',
        prompt: 'A user reports their laptop won\'t connect to Wi-Fi. Order these specific actions in the correct troubleshooting sequence.',
        items: [
          { id: 'reboot',   label: 'Reboot the laptop to rule out a temporary glitch' },
          { id: 'ask',      label: 'Ask the user: "When did it stop working? What changed?"' },
          { id: 'doc2',     label: 'Document: DHCP lease failure resolved by router restart' },
          { id: 'ipconfig', label: 'Run ipconfig to check IP assignment' },
          { id: 'router',   label: 'Restart the router after confirming DHCP server is unresponsive' },
          { id: 'confirm',  label: 'Confirm with user that Wi-Fi and internet are now working' },
        ],
        correctOrder: ['ask', 'ipconfig', 'reboot', 'router', 'confirm', 'doc2'],
        feedback: {
          correct: 'Correct! Gather info first (ask), diagnose (ipconfig), test theory (reboot), implement fix (restart router), verify (confirm with user), then document. This is the 6-step methodology applied to a real scenario.',
          incorrect: 'Remember the methodology: gather information FIRST (ask the user), then diagnose, then try fixes, verify with the user, and document LAST.',
        },
        hint: 'Documentation is ALWAYS last. Gathering information (asking the user) is ALWAYS first.',
      } as PBQStepDragOrder,
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INTERACTIVE: TERMINAL — Network Diagnostic Commands
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'net-terminal-commands',
    title: 'Network Diagnostic Terminal',
    category: 'networking',
    difficulty: 2,
    estimatedMinutes: 10,
    objectives: ['5.5', '2.1'],
    examCode: '220-1201',
    summary: 'Type the actual commands to diagnose a network problem — tests command recall, not just recognition.',
    context: `A user calls: "I can ping my router (192.168.1.1) but can't reach any websites. DNS might be the issue." You have remote terminal access. Work through the diagnosis by typing the appropriate commands.`,
    steps: [
      {
        type: 'terminal',
        id: 's1',
        prompt: 'First, verify the current IP configuration. Type the command to display full IP configuration details.',
        toolOutput: {
          label: 'Terminal — Windows 10',
          content: `Microsoft Windows [Version 10.0.19045]
(c) Microsoft Corporation. All rights reserved.

C:\\Users\\user>`,
        },
        commands: [
          {
            command: 'ipconfig /all',
            aliases: ['ipconfig/all', 'IPCONFIG /ALL', 'IPCONFIG/ALL'],
            isCorrect: true,
            feedback: 'Correct! `ipconfig /all` shows full details including DNS server addresses, DHCP server, MAC address, and lease information — everything you need to diagnose IP and DNS issues.',
            output: `Windows IP Configuration

   Host Name . . . . . . . . . . . . : WORKSTATION-01
   DNS Suffix Search List. . . . . . : home

Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . : home
   Description . . . . . . . . . . . : Intel Wireless-AC 9560
   Physical Address. . . . . . . . . : A4-C3-F0-85-22-11
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 192.168.1.47
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
   DHCP Server . . . . . . . . . . . : 192.168.1.1
   DNS Servers . . . . . . . . . . . : 192.168.1.1
   Lease Obtained. . . . . . . . . . : Saturday, April 19, 2026 9:00 AM
   Lease Expires . . . . . . . . . . : Sunday, April 20, 2026 9:00 AM`,
          },
          {
            command: 'ipconfig',
            aliases: ['IPCONFIG'],
            isCorrect: false,
            feedback: '`ipconfig` (without /all) shows basic IP info but omits DNS server addresses — which is exactly what you need to diagnose a DNS problem. Use `ipconfig /all` for full details.',
            output: `Windows IP Configuration

Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . : home
   IPv4 Address. . . . . . . . . . . : 192.168.1.47
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`,
          },
        ],
        defaultOutput: `'{{cmd}}' is not recognized as an internal or external command,
operable program or batch file.`,
        hint: 'The /all flag shows DNS server addresses and DHCP details — essential for diagnosing DNS problems.',
      } as PBQStepTerminal,
      {
        type: 'terminal',
        id: 's2',
        prompt: 'The DNS server is 192.168.1.1 (the router). Test whether DNS resolution is actually working by looking up a domain name.',
        commands: [
          {
            command: 'nslookup google.com',
            aliases: ['nslookup google.com 192.168.1.1', 'NSLOOKUP GOOGLE.COM', 'nslookup www.google.com'],
            isCorrect: true,
            feedback: 'Correct! `nslookup` queries DNS directly. If it times out or returns a server failure, DNS is the problem. If it resolves successfully but the browser fails, the issue is elsewhere.',
            output: `Server:  router.home
Address:  192.168.1.1

*** router.home can't find google.com: Server failed`,
          },
          {
            command: 'ping google.com',
            aliases: ['ping www.google.com', 'PING GOOGLE.COM'],
            isCorrect: false,
            feedback: '`ping google.com` would also reveal DNS failure (can\'t resolve hostname), but `nslookup` is the purpose-built DNS diagnostic tool. It gives more detail — which DNS server responded, the exact error type, and lets you query alternate DNS servers. Use `nslookup` when diagnosing DNS specifically.',
            output: `Ping request could not find host google.com.
Please check the name and try again.`,
          },
          {
            command: 'ping 8.8.8.8',
            aliases: ['ping 1.1.1.1', 'ping 8.8.4.4'],
            isCorrect: false,
            feedback: 'Pinging a public IP confirms internet connectivity but doesn\'t test DNS resolution. Since you already know the user can ping the router, the question is whether DNS is working — `nslookup` answers that directly.',
            output: `Pinging 8.8.8.8 with 32 bytes of data:
Reply from 8.8.8.8: bytes=32 time=14ms TTL=116
Reply from 8.8.8.8: bytes=32 time=13ms TTL=116
Reply from 8.8.8.8: bytes=32 time=15ms TTL=116
Reply from 8.8.8.8: bytes=32 time=14ms TTL=116

Ping statistics for 8.8.8.8:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`,
          },
        ],
        defaultOutput: `'{{cmd}}' is not recognized as an internal or external command,
operable program or batch file.`,
        hint: 'nslookup is the DNS-specific diagnostic tool. It queries a DNS server directly and shows whether resolution succeeds or fails.',
      } as PBQStepTerminal,
      {
        type: 'terminal',
        id: 's3',
        prompt: 'DNS lookup is failing via the router. The router\'s DNS may be down. Test whether DNS works using Google\'s public DNS server (8.8.8.8) directly.',
        commands: [
          {
            command: 'nslookup google.com 8.8.8.8',
            aliases: ['nslookup google.com 8.8.8.8', 'NSLOOKUP GOOGLE.COM 8.8.8.8'],
            isCorrect: true,
            feedback: 'Correct! By appending the DNS server IP, you bypass the router\'s DNS and query Google\'s DNS directly. If this succeeds, the router\'s DNS forwarding is broken — fix: configure the network adapter to use 8.8.8.8 as its DNS server.',
            output: `Server:  dns.google
Address:  8.8.8.8

Non-authoritative answer:
Name:    google.com
Addresses:  142.250.80.46
          2607:f8b0:4004:c1b::71`,
          },
          {
            command: 'nslookup google.com 1.1.1.1',
            aliases: ['NSLOOKUP GOOGLE.COM 1.1.1.1'],
            isCorrect: true,
            feedback: 'Also correct! Cloudflare\'s DNS (1.1.1.1) is another reliable public DNS server. Querying it directly with nslookup confirms whether the router\'s DNS forwarding is the problem.',
            output: `Server:  one.one.one.one
Address:  1.1.1.1

Non-authoritative answer:
Name:    google.com
Address:  142.250.80.46`,
          },
          {
            command: 'nslookup google.com',
            aliases: ['NSLOOKUP GOOGLE.COM'],
            isCorrect: false,
            feedback: 'Without specifying a DNS server, nslookup defaults to 192.168.1.1 (the router) — which you already know is failing. You need to test an alternate DNS server (like 8.8.8.8) to determine if the problem is the router\'s DNS specifically.',
            output: `Server:  router.home
Address:  192.168.1.1

*** router.home can't find google.com: Server failed`,
          },
        ],
        defaultOutput: `'{{cmd}}' is not recognized as an internal or external command,
operable program or batch file.`,
        hint: 'nslookup accepts an optional second argument: the DNS server to query. `nslookup google.com 8.8.8.8` bypasses the router.',
      } as PBQStepTerminal,
      {
        type: 'terminal',
        id: 's4',
        prompt: 'Google DNS resolves correctly. The router\'s DNS forwarding is broken. Set the DNS server on the network adapter to use 8.8.8.8 as a workaround. Type the netsh command to set the DNS server.',
        commands: [
          {
            command: 'netsh interface ip set dns "Wi-Fi" static 8.8.8.8',
            aliases: [
              'netsh interface ip set dns "wi-fi" static 8.8.8.8',
              'netsh interface ip set dns wi-fi static 8.8.8.8',
              'netsh interface ip set dns Wi-Fi static 8.8.8.8',
              'netsh interface ip set dns wifi static 8.8.8.8',
              'netsh interface ip set dns "wifi" static 8.8.8.8',
              'netsh interface ip set dnsservers "Wi-Fi" static 8.8.8.8',
              'netsh interface ip set dnsservers "wi-fi" static 8.8.8.8',
              'netsh interface ip set dnsservers Wi-Fi static 8.8.8.8',
              'netsh int ip set dns "Wi-Fi" static 8.8.8.8',
              'netsh int ip set dns "wi-fi" static 8.8.8.8',
              'netsh int ip set dns Wi-Fi static 8.8.8.8',
              'netsh int ip set dns wifi static 8.8.8.8',
              'netsh int ip set dnsservers "Wi-Fi" static 8.8.8.8',
              'netsh interface ipv4 set dns "Wi-Fi" static 8.8.8.8',
              'netsh interface ipv4 set dns "wi-fi" static 8.8.8.8',
              'netsh interface ipv4 set dns Wi-Fi static 8.8.8.8',
            ],
            isCorrect: true,
            feedback: 'Correct! `netsh interface ip set dns` sets a static DNS server on a specific adapter. This is the command-line equivalent of going to Network Adapter → IPv4 Properties → DNS. The user can now browse the internet.',
            output: `C:\\Users\\user>netsh interface ip set dns "Wi-Fi" static 8.8.8.8

C:\\Users\\user>`,
          },
          {
            command: 'ipconfig /flushdns',
            aliases: ['IPCONFIG /FLUSHDNS', 'ipconfig/flushdns'],
            isCorrect: false,
            feedback: '`ipconfig /flushdns` clears the local DNS cache — useful for stale records, but it doesn\'t change which DNS server is used. The problem is the DNS server itself (router) is failing, so you need to switch to a working server like 8.8.8.8.',
            output: `Windows IP Configuration

Successfully flushed the DNS Resolver Cache.`,
          },
          {
            command: 'ipconfig /registerdns',
            aliases: ['IPCONFIG /REGISTERDNS'],
            isCorrect: false,
            feedback: '`ipconfig /registerdns` re-registers the computer\'s DNS records with a domain DNS server — used in Active Directory environments, not relevant here. You need to change the DNS server to 8.8.8.8.',
            output: `Windows IP Configuration

Registration of the DNS resource records for all adapters of this computer
has been initiated. Any errors will be reported in the Event Viewer in
15 minutes.`,
          },
        ],
        defaultOutput: `'{{cmd}}' is not recognized as an internal or external command,
operable program or batch file.`,
        hint: 'Try: netsh interface ip set dns "Wi-Fi" static 8.8.8.8 — or use the "Show me the answer" button below after a couple attempts.',
      } as PBQStepTerminal,
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // HARDWARE: DISPLAY COMPONENT DIAGNOSIS
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'hw-display-diagnosis',
    title: 'Diagnose Display Component Failures',
    category: 'hardware',
    difficulty: 2,
    estimatedMinutes: 7,
    objectives: ['1.4'],
    examCode: '220-1201',
    summary: 'Match display failure symptoms to the broken component — digitizer, backlight, OLED panel, or protective glass.',
    context: `A repair shop has received four smartphones with different screen problems. You need to identify which display layer has failed in each case so you can order the correct replacement part.

Understanding the display layer stack is critical: Protective glass → Digitizer → LCD/OLED panel → Backlight (LCD only) → Frame.`,
    steps: [
      {
        type: 'drag_match',
        id: 's1',
        prompt: 'Match each failure symptom to the display component that has MOST LIKELY failed.',
        items: [
          { id: 'digitizer', label: 'Digitizer' },
          { id: 'backlight', label: 'LCD Backlight' },
          { id: 'oled',      label: 'OLED Panel' },
          { id: 'glass',     label: 'Protective Glass' },
        ],
        targets: [
          { id: 't1', label: 'Screen image is fine but touch is completely unresponsive', correctItemId: 'digitizer' },
          { id: 't2', label: 'Screen is dark; image faintly visible when flashlight held close', correctItemId: 'backlight' },
          { id: 't3', label: 'Permanent ghost image of navigation bar visible on white backgrounds', correctItemId: 'oled' },
          { id: 't4', label: 'Visible cracks on outer surface; display and touch still function normally', correctItemId: 'glass' },
        ],
        feedback: {
          correct: 'Perfect diagnosis! Digitizer = touch layer (image OK, touch fails). Backlight failure on LCD = dark screen, faint image visible with a light source. OLED burn-in = permanent ghost from static content. Cracked outer glass = cosmetic damage only if digitizer and panel are undamaged.',
          incorrect: 'Remember the layer order: Glass → Digitizer → LCD/OLED → Backlight. Each layer can fail independently. The flashlight test (faint image visible = backlight failed, panel OK) is a classic exam question.',
        },
        hint: 'Ask: is the image affected or just touch? Is the screen dark or just dim? The flashlight test reveals backlight failure.',
      } as PBQStepDragMatch,
      {
        id: 's2',
        prompt: 'A technician replaces a cracked iPhone screen with an aftermarket INCELL panel. The customer reports the screen looks slightly yellowish and brightness changes unpredictably. What is the MOST likely cause?',
        choices: [
          { id: 'a', text: 'The replacement panel is OLED instead of LCD, causing color shift', isCorrect: false, feedback: 'INCELL is a type of LCD — not OLED. The issue is not a panel technology mismatch.' },
          { id: 'b', text: 'The aftermarket panel lacks True Tone support, causing color temperature and auto-brightness inconsistencies', isCorrect: true, feedback: 'Correct. True Tone reads ambient light color temperature and adjusts the display. Non-OEM panels lack the calibration data for True Tone, causing the display to look warmer or cooler and auto-brightness to behave erratically. Always inform customers before using non-OEM parts.' },
          { id: 'c', text: 'The digitizer cable was not fully seated during reassembly', isCorrect: false, feedback: 'A loose digitizer cable causes touch issues, not color shift or brightness problems.' },
          { id: 'd', text: 'INCELL panels are incompatible with iPhones', isCorrect: false, feedback: 'INCELL panels do function in iPhones. The trade-off is loss of True Tone and color accuracy differences — not incompatibility.' },
        ],
      },
      {
        id: 's3',
        prompt: 'After replacing a display assembly, taps register about 5mm below where the user actually touched. What should the technician do FIRST?',
        choices: [
          { id: 'a', text: 'Replace the digitizer with an OEM part', isCorrect: false, feedback: 'The part may be fine — seating is the more likely culprit before declaring the part defective.' },
          { id: 'b', text: 'Reseat the digitizer ribbon cable and verify it is fully locked into the connector', isCorrect: true, feedback: 'Correct. Consistent touch offset is the classic symptom of an incorrectly seated digitizer ribbon cable. Re-seating resolves this in most cases.' },
          { id: 'c', text: 'Run a factory reset to clear digitizer calibration data', isCorrect: false, feedback: 'A factory reset will not fix a physical connector seating issue.' },
          { id: 'd', text: 'Replace the protective glass layer only', isCorrect: false, feedback: 'The protective glass does not process touch input — that is the digitizer\'s job.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // HARDWARE: CABLE & CONNECTOR IDENTIFICATION
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'hw-cable-connectors',
    title: 'Identify Cable and Connector Types',
    category: 'hardware',
    difficulty: 1,
    estimatedMinutes: 6,
    objectives: ['3.1'],
    examCode: '220-1201',
    summary: 'Match display and storage cable types to their correct descriptions — a common CompTIA hardware identification question.',
    context: `Technicians must identify cable types by specification. The A+ exam tests video connectors, storage interfaces, and peripheral cables. Match each cable or connector to its defining characteristic.`,
    steps: [
      {
        type: 'drag_match',
        id: 's1',
        prompt: 'Match each video connector type to its key characteristic.',
        items: [
          { id: 'hdmi', label: 'HDMI' },
          { id: 'dp',   label: 'DisplayPort' },
          { id: 'vga',  label: 'VGA' },
          { id: 'dvi',  label: 'DVI' },
        ],
        targets: [
          { id: 't1', label: 'Analog-only signal; 15-pin trapezoid connector; no digital support', correctItemId: 'vga' },
          { id: 't2', label: 'Carries audio + video; standard on consumer TVs and monitors', correctItemId: 'hdmi' },
          { id: 't3', label: 'Preferred on professional monitors; supports daisy-chaining multiple displays', correctItemId: 'dp' },
          { id: 't4', label: 'Carries digital and/or analog video; no audio; common on older monitors', correctItemId: 'dvi' },
        ],
        feedback: {
          correct: 'Excellent! VGA = legacy analog only. HDMI = audio + video, consumer standard. DisplayPort = professional, daisy-chain capable. DVI = digital/analog video, no audio.',
          incorrect: 'Key distinctions: VGA is the only purely analog connector. HDMI carries audio too. DisplayPort supports multi-monitor daisy-chaining. DVI is digital but carries no audio.',
        },
        hint: 'VGA is the oldest and only analog one. HDMI is what plugs into a TV. DisplayPort is common on gaming monitors and workstations.',
      } as PBQStepDragMatch,
      {
        type: 'drag_match',
        id: 's2',
        prompt: 'Match each storage interface to its defining characteristic.',
        items: [
          { id: 'sata', label: 'SATA III' },
          { id: 'nvme', label: 'NVMe (M.2)' },
          { id: 'ide',  label: 'IDE / PATA' },
          { id: 'usb',  label: 'USB 3.0' },
        ],
        targets: [
          { id: 't1', label: 'Legacy wide ribbon cable; 40 or 80 conductors; replaced by SATA', correctItemId: 'ide' },
          { id: 't2', label: 'Current mainstream internal drive interface; thin L-shaped data cable; ~600 MB/s max', correctItemId: 'sata' },
          { id: 't3', label: 'PCIe-based M.2 interface; 3,500+ MB/s sequential read speeds', correctItemId: 'nvme' },
          { id: 't4', label: 'External interface; blue port = 5 Gbps; used for external drives and flash drives', correctItemId: 'usb' },
        ],
        feedback: {
          correct: 'Correct! IDE = wide ribbon cable (legacy). SATA III = standard internal HDD/SSD at ~600 MB/s. NVMe M.2 = fastest at 3,500+ MB/s via PCIe. USB 3.0 (blue) = 5 Gbps external.',
          incorrect: 'Key speeds: SATA III ≈ 600 MB/s, NVMe = 3,500+ MB/s, USB 3.0 = 5 Gbps. IDE is the legacy wide ribbon cable from the pre-SATA era.',
        },
        hint: 'NVMe is the fastest — it uses the PCIe bus, not SATA. The blue USB port is always USB 3.0.',
      } as PBQStepDragMatch,
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // HARDWARE: LAPTOP BATTERY REPLACEMENT — DRAG ORDER
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'hw-battery-replacement',
    title: 'Laptop Battery Replacement Procedure',
    category: 'hardware',
    difficulty: 1,
    estimatedMinutes: 5,
    objectives: ['1.1'],
    examCode: '220-1201',
    summary: 'Put the steps for safely replacing a laptop battery in the correct order — safety and ESD procedures tested.',
    context: `A customer's laptop battery no longer holds a charge. You will replace the internal battery. The correct order matters — skipping safety steps can damage components or injure you.`,
    steps: [
      {
        type: 'drag_order',
        id: 's1',
        prompt: 'Place these laptop battery replacement steps in the correct order (1 = first, 7 = last).',
        items: [
          { id: 'power_off',   label: 'Shut down the laptop completely (not sleep/hibernate)' },
          { id: 'disconnect',  label: 'Unplug the AC adapter from the laptop' },
          { id: 'esd',         label: 'Put on an anti-static wrist strap and attach it to a grounded surface' },
          { id: 'open',        label: 'Remove the bottom panel screws and lift off the cover' },
          { id: 'remove_bat',  label: 'Disconnect the battery connector and remove the old battery' },
          { id: 'install_bat', label: 'Seat the new battery and reconnect the battery connector' },
          { id: 'test',        label: 'Reassemble, power on, and verify the battery charges correctly' },
        ],
        correctOrder: ['power_off', 'disconnect', 'esd', 'open', 'remove_bat', 'install_bat', 'test'],
        feedback: {
          correct: 'Perfect! (1) Shut down fully → (2) Unplug AC → (3) ESD protection → (4) Open chassis → (5) Remove old battery → (6) Install new battery → (7) Reassemble and test. Never skip ESD or work on a plugged-in device.',
          incorrect: 'Key safety rules: fully power off AND unplug the AC adapter BEFORE opening the chassis. ESD protection goes on before you touch any internal components.',
        },
        hint: 'Safety first: power off → unplug → ESD strap → then open. ESD comes BEFORE you touch anything inside.',
      } as PBQStepDragOrder,
      {
        id: 's2',
        prompt: 'While replacing the battery, you touch the motherboard without wearing an ESD wrist strap. What is the GREATEST risk?',
        choices: [
          { id: 'a', text: 'The battery may not charge correctly after installation', isCorrect: false, feedback: 'Charging behavior is not related to ESD during installation.' },
          { id: 'b', text: 'Static electricity from your body can damage sensitive components on the motherboard', isCorrect: true, feedback: 'Correct. Electrostatic discharge (ESD) can permanently damage semiconductors — capacitors, CPU, RAM — even at voltages too low to feel. ESD wrist straps divert this charge safely to ground.' },
          { id: 'c', text: 'The chassis screws may strip due to improper grounding', isCorrect: false, feedback: 'ESD has no effect on mechanical fasteners.' },
          { id: 'd', text: 'The battery may short-circuit when reconnected', isCorrect: false, feedback: 'A short circuit is caused by a conductive object bridging battery terminals — not ESD from skin contact with the motherboard.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OS: WINDOWS USER MANAGEMENT TERMINAL
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'os-user-management',
    title: 'Windows User Account Management',
    category: 'os',
    difficulty: 2,
    estimatedMinutes: 10,
    objectives: ['1.6'],
    examCode: '220-1202',
    summary: 'Use net user and net localgroup commands to create accounts, set passwords, and manage group membership.',
    context: `A new employee named "jsmith" needs a Windows local account on their workstation. You will create the account, set a password, and add them to the appropriate local group using command-line tools.

Open a Command Prompt running as Administrator to begin.`,
    steps: [
      {
        type: 'terminal',
        id: 's1',
        prompt: 'Create a new local user account named "jsmith" with the password "Temp@1234".',
        toolOutput: {
          label: 'Context',
          content: 'You are at an elevated Command Prompt (Run as Administrator) on a Windows 11 workstation.',
        },
        commands: [
          {
            command: 'net user jsmith Temp@1234 /add',
            aliases: [
              'net user "jsmith" Temp@1234 /add',
              'net user jsmith "Temp@1234" /add',
              'net user "jsmith" "Temp@1234" /add',
            ],
            output: 'The command completed successfully.',
            isCorrect: true,
            feedback: 'Correct! "net user <username> <password> /add" creates a new local user account. This account will appear in Local Users and Groups (lusrmgr.msc) and can be used to log into Windows.',
          },
          {
            command: 'net user',
            aliases: [],
            output: '\\\\WORKSTATION01\n\n-------------------------------------------------------------------------------\nAdministrator            DefaultAccount           Guest\nWDAGUtilityAccount\nThe command completed successfully.',
            isCorrect: false,
            feedback: 'This lists existing users but does not create an account. Add the username, password, and /add flag.',
          },
          {
            command: 'net localgroup',
            aliases: [],
            output: 'Aliases for \\\\WORKSTATION01\n\n-------------------------------------------------------------------------------\n*Administrators\n*Backup Operators\n*Guests\n*Remote Desktop Users\n*Users\nThe command completed successfully.',
            isCorrect: false,
            feedback: 'This lists local groups — useful later. First create the user: net user jsmith Temp@1234 /add',
          },
        ],
        defaultOutput: 'The syntax of this command is:\n\nNET USER\n[username [password | *] [options]] [/DOMAIN]\n         username {password | *} /ADD [options] [/DOMAIN]',
        hint: 'net user jsmith Temp@1234 /add',
      } as PBQStepTerminal,
      {
        type: 'terminal',
        id: 's2',
        prompt: 'Add jsmith to the local "Users" group so they can log in with standard permissions.',
        commands: [
          {
            command: 'net localgroup Users jsmith /add',
            aliases: [
              'net localgroup "Users" jsmith /add',
              'net localgroup users jsmith /add',
              'net localgroup Users "jsmith" /add',
              'net localgroup "Users" "jsmith" /add',
            ],
            output: 'The command completed successfully.',
            isCorrect: true,
            feedback: 'Correct! "net localgroup <group> <username> /add" adds a user to a local group. The "Users" group provides standard (non-admin) login rights — always apply the principle of least privilege.',
          },
          {
            command: 'net localgroup Administrators jsmith /add',
            aliases: [
              'net localgroup "Administrators" jsmith /add',
              'net localgroup administrators jsmith /add',
            ],
            output: 'The command completed successfully.',
            isCorrect: false,
            feedback: 'This grants Administrator rights — more privilege than a standard employee needs. Principle of least privilege: use the "Users" group for standard accounts.',
          },
          {
            command: 'net user jsmith',
            aliases: [],
            output: 'User name                    jsmith\nAccount active               Yes\nPassword last set            4/22/2026 9:00:00 AM\n\nLocal Group Memberships      (none)\nThe command completed successfully.',
            isCorrect: false,
            feedback: 'This shows account details — jsmith exists but has no group membership yet. Add to Users group: net localgroup Users jsmith /add',
          },
        ],
        defaultOutput: 'The syntax of this command is:\n\nNET LOCALGROUP\n[groupname [/COMMENT:"text"]] [/DOMAIN]\ngroupname name [...] {/ADD | /DELETE} [/DOMAIN]',
        hint: 'net localgroup Users jsmith /add',
      } as PBQStepTerminal,
      {
        type: 'terminal',
        id: 's3',
        prompt: 'jsmith forgot their temporary password before logging in. Reset it to "NewPass@5678".',
        commands: [
          {
            command: 'net user jsmith NewPass@5678',
            aliases: [
              'net user "jsmith" NewPass@5678',
              'net user jsmith "NewPass@5678"',
              'net user "jsmith" "NewPass@5678"',
            ],
            output: 'The command completed successfully.',
            isCorrect: true,
            feedback: 'Correct! To reset a password on an existing account, use "net user <username> <newpassword>" without /add. This immediately changes the password.',
          },
          {
            command: 'net user jsmith NewPass@5678 /add',
            aliases: [],
            output: 'The account already exists.',
            isCorrect: false,
            feedback: '/add is only for creating new accounts. Omit it to reset the password: net user jsmith NewPass@5678',
          },
          {
            command: 'net user jsmith *',
            aliases: [],
            output: 'Type a password for the user:\nRetype the password to confirm:\n(Interactive password entry — not available in this simulation)',
            isCorrect: false,
            feedback: 'The * flag prompts for interactive password entry. Provide the password directly in the command: net user jsmith NewPass@5678',
          },
        ],
        defaultOutput: 'The syntax of this command is:\n\nNET USER\n[username [password | *] [options]] [/DOMAIN]',
        hint: 'net user jsmith <newpassword>  — no /add needed, just username and new password',
      } as PBQStepTerminal,
    ],
  },
]
