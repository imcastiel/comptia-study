export const GLOSSARY: Record<string, string> = {
  // Storage
  'RAM': 'Random Access Memory — volatile memory that stores data the CPU is actively using. Lost when power is removed.',
  'ROM': 'Read-Only Memory — non-volatile memory that retains data without power. Stores firmware like BIOS/UEFI.',
  'HDD': 'Hard Disk Drive — storage device using spinning magnetic platters and read/write heads.',
  'SSD': 'Solid State Drive — storage using NAND flash memory chips with no moving parts. Much faster than HDDs.',
  'NVMe': 'Non-Volatile Memory Express — high-speed SSD protocol over PCIe. Up to 7000+ MB/s vs SATA\'s 550 MB/s.',
  'SATA': 'Serial ATA — interface standard for connecting storage devices. Max speed: 600 MB/s (SATA III).',
  'NAND': 'A type of flash memory used in SSDs and USB drives. Named after the NAND logic gate.',
  'TRIM': 'A command that tells an SSD which deleted blocks can be pre-erased, maintaining write performance over time.',

  // Processors & Motherboard
  'CPU': 'Central Processing Unit — the main processor that executes program instructions.',
  'GPU': 'Graphics Processing Unit — dedicated processor for rendering graphics and parallel computations.',
  'TDP': 'Thermal Design Power — the maximum sustained heat (in watts) the CPU/GPU produces that cooling must handle.',
  'BIOS': 'Basic Input/Output System — legacy firmware that initializes hardware at boot. Limited to 2 TB drives and MBR.',
  'UEFI': 'Unified Extensible Firmware Interface — modern BIOS replacement. Supports drives >2 TB, GPT, Secure Boot, and mouse.',
  'CMOS': 'Complementary Metal-Oxide Semiconductor — chip storing BIOS settings (date, time, boot order). Kept alive by CR2032 battery.',
  'POST': 'Power-On Self-Test — diagnostic sequence run by BIOS/UEFI at every startup to check hardware.',
  'PCIe': 'Peripheral Component Interconnect Express — high-speed serial bus for GPUs, NVMe SSDs, and expansion cards.',
  'MBR': 'Master Boot Record — legacy partition table format. Limited to 2 TB drives and 4 primary partitions.',
  'GPT': 'GUID Partition Table — modern partition format used with UEFI. Supports drives >2 TB.',
  'ESD': 'Electrostatic Discharge — sudden static electricity transfer that can permanently damage computer components.',
  'LGA': 'Land Grid Array — CPU socket type where pins are in the socket (not the CPU). Used by Intel.',
  'PGA': 'Pin Grid Array — CPU socket type where pins are on the CPU bottom. Used by AMD through AM4.',
  'SMT': 'Simultaneous Multi-Threading — AMD\'s implementation of hyperthreading. Allows one core to run two threads.',
  'XMP': 'Extreme Memory Profile — Intel\'s standard for RAM to automatically run at its rated speed above JEDEC spec.',
  'EXPO': 'Extended Profiles for Overclocking — AMD\'s equivalent of Intel XMP for DDR5 memory speed profiles.',

  // Power
  'PSU': 'Power Supply Unit — converts AC mains power to DC voltages (12V, 5V, 3.3V) for computer components.',
  'UPS': 'Uninterruptible Power Supply — battery backup that provides power during outages and protects against surges.',
  'PFC': 'Power Factor Correction — circuit that improves how efficiently a PSU draws current from the AC line.',

  // Display
  'LCD': 'Liquid Crystal Display — screen technology using liquid crystals and a backlight (LED or CCFL).',
  'LED': 'Light Emitting Diode — used as backlighting in modern LCD screens. More efficient than CCFL.',
  'OLED': 'Organic Light Emitting Diode — each pixel emits its own light. True blacks, infinite contrast, no backlight needed.',
  'TN': 'Twisted Nematic — LCD panel type with fast response times (1–5ms) but poor viewing angles. Used in gaming monitors.',
  'IPS': 'In-Plane Switching — LCD panel type with excellent color accuracy and wide viewing angles (~178°). Common in design monitors.',
  'VA': 'Vertical Alignment — LCD panel type with high contrast ratios and good colors. Response times between TN and IPS.',
  'HDMI': 'High-Definition Multimedia Interface — carries both audio and video over a single cable. Common on TVs and monitors.',
  'VGA': 'Video Graphics Array — older analog video connector (15-pin D-sub). No audio. Being phased out.',
  'DVI': 'Digital Visual Interface — video connector supporting both analog and digital signals. Common on older monitors.',
  'eDP': 'Embedded DisplayPort — internal laptop display connection. Replaces LVDS in modern laptops.',
  'LVDS': 'Low-Voltage Differential Signaling — older internal laptop display connection, replaced by eDP.',

  // Networking
  'NIC': 'Network Interface Card — hardware that connects a computer to a network. Can be wired (Ethernet) or wireless.',
  'DNS': 'Domain Name System — translates human-readable hostnames (google.com) to IP addresses computers use.',
  'DHCP': 'Dynamic Host Configuration Protocol — automatically assigns IP addresses, subnet masks, and gateway to devices.',
  'TCP': 'Transmission Control Protocol — reliable, connection-oriented transport protocol. Guarantees delivery and order.',
  'UDP': 'User Datagram Protocol — fast, connectionless transport protocol. No guaranteed delivery. Used for streaming/gaming.',
  'HTTP': 'Hypertext Transfer Protocol — protocol for transferring web pages. Unencrypted. Uses port 80.',
  'HTTPS': 'HTTP Secure — HTTP encrypted with TLS. Protects against eavesdropping. Uses port 443.',
  'FTP': 'File Transfer Protocol — transfers files between client and server. Unencrypted. Ports 20 (data) and 21 (control).',
  'SSH': 'Secure Shell — encrypted protocol for remote terminal access. Replaces Telnet. Uses port 22.',
  'SMTP': 'Simple Mail Transfer Protocol — sends outbound email between servers and from clients to servers. Port 25.',
  'IMAP': 'Internet Message Access Protocol — retrieves email while keeping it on the server. Syncs across devices. Port 143.',
  'POP3': 'Post Office Protocol v3 — downloads email to local device, typically removes from server. Port 110.',
  'NAT': 'Network Address Translation — maps private IP addresses to a public IP, allowing many devices to share one public IP.',
  'PAT': 'Port Address Translation — a form of NAT that tracks connections by port number. How home routers work.',
  'VPN': 'Virtual Private Network — encrypted tunnel over the internet for secure remote access to a private network.',
  'VLAN': 'Virtual Local Area Network — logically segments a physical network into isolated broadcast domains.',
  'APIPA': 'Automatic Private IP Addressing — self-assigned 169.254.x.x address when DHCP fails. Indicates DHCP connectivity problem.',
  'SSID': 'Service Set Identifier — the name of a Wi-Fi network broadcast by an access point.',
  'WPA': 'Wi-Fi Protected Access — wireless encryption protocol. WPA2 uses AES; WPA3 adds SAE for stronger security.',
  'WEP': 'Wired Equivalent Privacy — deprecated wireless encryption. Completely broken and crackable in minutes. Never use.',
  'MIMO': 'Multiple Input Multiple Output — uses multiple antennas simultaneously to increase wireless throughput.',
  'PoE': 'Power over Ethernet — delivers electrical power through Ethernet cables, eliminating separate power adapters.',
  'SMB': 'Server Message Block — Windows protocol for shared file and printer access over a network.',
  'RDP': 'Remote Desktop Protocol — Microsoft protocol for full graphical remote control of Windows systems. Port 3389.',
  'SNMP': 'Simple Network Management Protocol — monitors and manages network devices (switches, routers, UPS). Ports 161/162.',
  'LDAP': 'Lightweight Directory Access Protocol — queries directory services like Active Directory. Port 389.',
  'NTP': 'Network Time Protocol — synchronizes clocks across network devices to a common time source. UDP port 123.',
  'WAP': 'Wireless Access Point — device that provides Wi-Fi connectivity and bridges wireless clients to the wired network.',
  'ISP': 'Internet Service Provider — company that provides internet access (Comcast, AT&T, Verizon, etc.).',
  'DMZ': 'Demilitarized Zone — network segment between the internet and internal network for public-facing servers.',
  'QoS': 'Quality of Service — prioritizes certain traffic types (VoIP, video) to ensure performance for critical applications.',
  'CIDR': 'Classless Inter-Domain Routing — notation for IP addresses and their subnet masks (e.g., 192.168.1.0/24).',
  'MAC': 'Media Access Control address — unique hardware identifier burned into every network interface (format: XX:XX:XX:XX:XX:XX).',

  // Wireless
  'WPS': 'Wi-Fi Protected Setup — simplified Wi-Fi connection method. PIN mode has security vulnerabilities — disable it.',
  'MU-MIMO': 'Multi-User MIMO — allows a wireless access point to communicate with multiple clients simultaneously.',
  'OFDMA': 'Orthogonal Frequency Division Multiple Access — Wi-Fi 6 feature that splits channels for multiple simultaneous clients.',

  // Virtualization & Cloud
  'VM': 'Virtual Machine — software emulation of a complete computer, running inside a hypervisor.',
  'VDI': 'Virtual Desktop Infrastructure — centralized desktop environments delivered over a network to thin clients.',
  'IaaS': 'Infrastructure as a Service — cloud model providing raw compute, storage, and networking (AWS EC2, Azure VMs).',
  'PaaS': 'Platform as a Service — cloud model providing a development platform without managing the underlying infrastructure.',
  'SaaS': 'Software as a Service — cloud model where fully functional software is delivered over the internet (Gmail, Salesforce).',

  // Mobile
  'MDM': 'Mobile Device Management — software platform to enroll, configure, monitor, and remotely wipe mobile devices.',
  'NFC': 'Near Field Communication — wireless communication within ~4 cm. Used for mobile payments and access control.',

  // Security
  'MFA': 'Multi-Factor Authentication — requires two or more verification factors: something you know, have, or are.',
  'AES': 'Advanced Encryption Standard — symmetric encryption standard. Used in WPA2/WPA3, TLS, and full-disk encryption.',

  // Printing
  'MFD': 'Multifunction Device — printer that also scans, copies, and often faxes. Also called MFP (Multifunction Printer).',
  'PCR': 'Primary Charge Roller — component in laser printers that applies uniform negative charge to the photosensitive drum.',

  // Storage (cont.)
  'RAID': 'Redundant Array of Independent Disks — combines multiple drives for performance, redundancy, or both.',
  'SAS': 'Serial Attached SCSI — enterprise storage interface. Faster than SATA, supports dual-port redundancy.',
  'SMART': 'Self-Monitoring, Analysis and Reporting Technology — built-in drive health monitoring. Warning = back up immediately.',
}
