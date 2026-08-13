const knowledgeBase = [
    {
        id: 1,
        category: 'Phishing',
        description: 'Phishing is a cybercrime in which a target or targets are contacted by email, telephone or text message by someone posing as a legitimate institution to lure individuals into providing sensitive data such as personally identifiable information, banking and credit card details, and passwords.',
        impact: 'Data loss, financial loss, credential theft.',
        prevention: 'Verify sender email addresses, do not click on suspicious links, enable MFA.'
    },
    {
        id: 2,
        category: 'Ransomware',
        description: 'Ransomware is malware designed to deny a user or organization access to files on their computer. By encrypting these files and demanding a ransom payment for the decryption key, cyberattackers place organizations in a position where paying the ransom is the easiest and cheapest way to regain access to their files.',
        impact: 'Operational downtime, financial loss, data loss, reputational damage.',
        prevention: 'Maintain offline backups, apply security patches, use anti-ransomware software.'
    },
    {
        id: 3,
        category: 'Data Breach',
        description: 'A data breach is a security incident in which information is accessed without authorization. Data breaches can hurt businesses and consumers in a variety of ways. They are a costly expense that can damage lives and reputations.',
        impact: 'Loss of customer trust, regulatory fines, legal action.',
        prevention: 'Encrypt sensitive data, enforce strict access controls, monitor network traffic.'
    },
    {
        id: 4,
        category: 'Social Engineering',
        description: 'Social engineering is the psychological manipulation of people into performing actions or divulging confidential information. A type of confidence trick for the purpose of information gathering, fraud, or system access.',
        impact: 'Unauthorized system access, information leakage.',
        prevention: 'Employee awareness training, strict physical security policies, verify identities.'
    },
    {
        id: 5,
        category: 'Insider Threats',
        description: 'An insider threat is a malicious threat to an organization that comes from people within the organization, such as employees, former employees, contractors or business associates, who have inside information concerning the organization\'s security practices, data and computer systems.',
        impact: 'Data theft, sabotage, fraud.',
        prevention: 'Principle of least privilege, monitor employee activity, conduct background checks.'
    },
    {
        id: 6,
        category: 'Malware',
        description: 'Malware is any software intentionally designed to cause disruption to a computer, server, client, or computer network, leak private information, gain unauthorized access to information or systems, deprive access to information, or which unknowingly interferes with the user\'s computer security and privacy.',
        impact: 'System corruption, data theft, unauthorized access, degraded performance.',
        prevention: 'Use Next-Generation Antivirus (NGAV), keep software updated, enforce endpoint detection and response (EDR).'
    },
    {
        id: 7,
        category: 'DDoS (Distributed Denial of Service)',
        description: 'A DDoS attack is a malicious attempt to disrupt the normal traffic of a targeted server, service or network by overwhelming the target or its surrounding infrastructure with a flood of Internet traffic.',
        impact: 'Service unavailability, revenue loss, reputational damage.',
        prevention: 'Implement DDoS mitigation services, utilize load balancers, configure Web Application Firewalls (WAF).'
    },
    {
        id: 8,
        category: 'SQL Injection',
        description: 'SQL injection is a code injection technique used to attack data-driven applications, in which malicious SQL statements are inserted into entry fields for execution (e.g. to dump the database contents to the attacker).',
        impact: 'Database compromise, unauthorized data viewing, data manipulation or deletion.',
        prevention: 'Use prepared statements and parameterized queries, validate and sanitize all user input.'
    },
    {
        id: 9,
        category: 'Zero-Day Exploit',
        description: 'A zero-day exploit is a cyberattack that occurs on the same day a weakness is discovered in software. At that point, it\'s exploited before a fix becomes available from its creator.',
        impact: 'Complete system compromise, data exfiltration, stealthy persistence.',
        prevention: 'Implement robust heuristic behavioral monitoring, network segmentation, and rapid patch management protocols.'
    }
];

module.exports = knowledgeBase;
