// Programmatic-SEO modifier types. One project = one angle (locked at
// creation); each page within shares it. The wizard, projects view, and the
// API all read from this single source.

export const MODIFIERS = {
  location: {
    dropdownLabel: 'Location-based', valueLabel: 'City or area', valueLabelPlural: 'Locations',
    placeholder: 'e.g., Chicago', hint: 'The city or area this page targets.',
    preposition: 'in', example: 'plumbing in Chicago',
    areaLine: 'Six real neighborhood, suburb, or district names near the location',
    keywordPlaceholder: 'e.g., emergency plumber',
    bulkPlaceholder: 'Chicago\nNew York\nLos Angeles\nHouston\nPhoenix',
    pairsLabel: 'Keyword, Location pairs',
    pairsPlaceholder: 'emergency plumber, Chicago\ndrain cleaning, New York\nboiler repair, Los Angeles',
    countNoun: 'location',
  },
  comparison: {
    dropdownLabel: 'Comparison (vs)', valueLabel: 'Compared with', valueLabelPlural: 'Competitors',
    placeholder: 'e.g., Asana', hint: 'The product, brand, or option you’re comparing against.',
    preposition: 'vs', example: 'Notion vs Asana',
    areaLine: 'Six related products, brands, or alternatives in the same category',
    keywordPlaceholder: 'e.g., Notion',
    bulkPlaceholder: 'Asana\nMonday\nClickUp\nTrello\nLinear',
    pairsLabel: 'Keyword, Competitor pairs',
    pairsPlaceholder: 'Notion, Asana\nNotion, Monday\nNotion, ClickUp',
    countNoun: 'comparison',
  },
  integration: {
    dropdownLabel: 'Integration (with)', valueLabel: 'Integrates with', valueLabelPlural: 'Integrations',
    placeholder: 'e.g., Slack', hint: 'The third-party tool this page covers integration with.',
    preposition: 'integration with', example: 'Salesforce integration with Slack',
    areaLine: 'Six common integration use cases or related apps',
    keywordPlaceholder: 'e.g., Salesforce',
    bulkPlaceholder: 'Slack\nMicrosoft Teams\nGmail\nZapier\nHubSpot',
    pairsLabel: 'Keyword, Integration pairs',
    pairsPlaceholder: 'Salesforce, Slack\nSalesforce, HubSpot\nSalesforce, Gmail',
    countNoun: 'integration',
  },
  audience: {
    dropdownLabel: 'Audience (for)', valueLabel: 'Target audience', valueLabelPlural: 'Audiences',
    placeholder: 'e.g., freelancers', hint: 'The specific audience this page is for.',
    preposition: 'for', example: 'invoicing software for freelancers',
    areaLine: 'Six adjacent audiences or sub-segments who also benefit',
    keywordPlaceholder: 'e.g., invoicing software',
    bulkPlaceholder: 'freelancers\nstartups\nremote teams\nagencies\ndesigners',
    pairsLabel: 'Keyword, Audience pairs',
    pairsPlaceholder: 'invoicing software, freelancers\ninvoicing software, startups\ninvoicing software, agencies',
    countNoun: 'audience',
  },
  usecase: {
    dropdownLabel: 'Use case (for)', valueLabel: 'Use case', valueLabelPlural: 'Use cases',
    placeholder: 'e.g., remote teams', hint: 'The specific scenario this page covers.',
    preposition: 'for', example: 'video calling for remote teams',
    areaLine: 'Six related use cases or scenarios the keyword also serves',
    keywordPlaceholder: 'e.g., video calling',
    bulkPlaceholder: 'remote teams\ncustomer support\nproduct demos\nclassroom learning\nclient calls',
    pairsLabel: 'Keyword, Use case pairs',
    pairsPlaceholder: 'video calling, remote teams\nvideo calling, customer support\nvideo calling, classrooms',
    countNoun: 'use case',
  },
  none: {
    dropdownLabel: 'Just the keyword', valueLabel: '', valueLabelPlural: '',
    placeholder: '', hint: '', preposition: '', example: 'just the keyword',
    areaLine: 'Six related categories or sub-topics',
    keywordPlaceholder: 'e.g., your service or product',
    bulkPlaceholder: '', pairsLabel: '', pairsPlaceholder: '', countNoun: 'entry',
  },
};

export function modifierOrDefault(type) {
  return MODIFIERS[type] ? type : 'location';
}

// "Notion vs Asana", "plumbing in Chicago", "Notion" (when value missing).
export function phraseFor(type, keyword, value) {
  const m = MODIFIERS[modifierOrDefault(type)];
  const k = (keyword || '').trim();
  const v = (value || '').trim();
  if (!v || !m.preposition) return k;
  const kl = k.toLowerCase();
  const vl = v.toLowerCase();
  // De-dup both directions: users sometimes paste the full phrase into the
  // modifier value field (e.g. value = "video caller id for delivery drivers"
  // when keyword is already "video caller id"). Use whichever side already
  // contains the other as the complete phrase.
  if (kl.includes(vl)) return k;       // keyword has it → use keyword alone
  if (vl.includes(kl)) return v;       // value has the keyword in it → use value alone
  return `${k} ${m.preposition} ${v}`;
}
