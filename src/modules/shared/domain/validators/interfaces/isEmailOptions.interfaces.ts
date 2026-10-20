export interface IsEmailOptions {
  allow_ip_domain?: boolean;
  domain_specific?: string;
  blacklisted_chars?: string[];
  host_blacklist?: string[];
  host_whitelist?: string[];
}
