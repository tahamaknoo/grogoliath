// Shared template-preview helpers used by TemplatesView (gallery previews +
// full-screen preview) and CustomizeTemplateModal (live preview while editing).
// Substitutes {{PLACEHOLDER}} tokens with realistic demo copy so users see
// what a template actually looks like instead of raw placeholder text.

export const HIDE_SCROLL_CSS = '<style>html,body{overflow:hidden!important;scrollbar-width:none!important}html::-webkit-scrollbar,body::-webkit-scrollbar,*::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}</style>';

// Blocks link navigation and form submission inside the generated-preview
// iframe so a stray click can't replace the iframe contents with a broken
// page or external site. `tel:` links pass through so click-to-call still
// works on mobile. Buttons and other JS interactions are left alone.
export const PREVENT_NAV_SCRIPT = `<script>
(function() {
  document.addEventListener('click', function(e) {
    var t = e.target;
    while (t && t.nodeType === 1 && t !== document.body) {
      if (t.tagName === 'A') {
        var href = (t.getAttribute('href') || '').trim();
        if (!/^tel:/i.test(href)) {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }
      t = t.parentElement;
    }
  }, true);
  document.addEventListener('submit', function(e) { e.preventDefault(); }, true);
})();
</script>`;

export function withPreviewSafety(html) {
  if (!html) return html;
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, PREVENT_NAV_SCRIPT + '</body>');
  if (/<\/html>/i.test(html)) return html.replace(/<\/html>/i, PREVENT_NAV_SCRIPT + '</html>');
  return html + PREVENT_NAV_SCRIPT;
}

// Disable all link/button/form interactions inside the preview iframe so clicks
// don't navigate to broken anchors (#contact etc.) or submit forms.
export const DISABLE_INTERACTIONS = `<style>
  a, button, [role="button"] { cursor: default !important; }
  a:hover, button:hover { text-decoration: none !important; }
</style>
<script>
  (function() {
    var stop = function(e) {
      var t = e.target.closest && e.target.closest('a, button, [role="button"], form, input, textarea, select');
      if (t) { e.preventDefault(); e.stopPropagation(); }
    };
    document.addEventListener('click', stop, true);
    document.addEventListener('submit', stop, true);
    document.addEventListener('keydown', function(e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('a, button')) {
        e.preventDefault();
      }
    }, true);
  })();
</script>`;

// Replaces every known {{PLACEHOLDER}} in a template's HTML with demo content.
// Pass `{ hideScroll: true }` for tiny thumbnails (hides scrollbars), `false`
// for full-screen previews where scrolling is desirable.
// Pass `{ disableInteractions: false }` for the customize modal where clicking
// in/out of the preview shouldn't be blocked at the iframe level.
// Stable sample image for previews — Picsum's `?seed=` gives a deterministic
// photo, so previews don't churn between renders. Landscape aspect (1200x600)
// matches the hero-img-wrap CSS in the starter templates.
const PREVIEW_HERO_IMAGE = 'https://picsum.photos/seed/grogoliath-preview/1200/600';
const PREVIEW_HERO_CREDIT = 'Sample image · replaced with your photo on generation';

export const previewHtml = (html, { hideScroll = true, disableInteractions = true } = {}) =>
  ((hideScroll ? HIDE_SCROLL_CSS : '') + (disableInteractions ? DISABLE_INTERACTIONS : '') + (html || ''))
  // Hero-image block: strip the BLOCK markers (they're comments used by the
  // generation API to remove the whole block when no image is set; in a
  // preview, we always show a sample). MUST run before the catch-all so the
  // generic substitution doesn't turn {{HERO_IMAGE}} into "Sample content"
  // inside the <img src="…"> attribute.
  .replace(/<!--\s*\{\{\s*HERO_IMG_BLOCK_START\s*\}\}\s*-->/g, '')
  .replace(/<!--\s*\{\{\s*HERO_IMG_BLOCK_END\s*\}\}\s*-->/g, '')
  .replace(/\{\{\s*HERO_IMAGE_URL\s*\}\}/g, PREVIEW_HERO_IMAGE)
  .replace(/\{\{\s*HERO_IMAGE\s*\}\}/g, PREVIEW_HERO_IMAGE)
  .replace(/\{\{\s*IMAGE_URL\s*\}\}/g, PREVIEW_HERO_IMAGE)
  .replace(/\{\{\s*HERO_IMG_CREDIT\s*\}\}/g, PREVIEW_HERO_CREDIT)
  // Business page placeholders
  .replace(/\{\{KEYWORD\}\}/g, 'Your Business')
  .replace(/\{\{LOCATION\}\}/g, 'Your City')
  .replace(/\{\{SERVICE\}\}/g, 'Your Service')
  .replace(/\{\{TAGLINE\}\}/g, 'Professional • Reliable • Trusted')
  .replace(/\{\{PHONE\}\}/g, '(555) 000-0000')
  .replace(/\{\{EMAIL\}\}/g, 'hello@yourbusiness.com')
  .replace(/\{\{HERO_HEADLINE\}\}/g, 'Your Business Name')
  .replace(/\{\{HERO_SUB\}\}/g, 'Professional services you can trust.')
  .replace(/\{\{CTA_PRIMARY\}\}/g, 'Get Started')
  .replace(/\{\{CTA_SECONDARY\}\}/g, 'Learn More')
  // Blog placeholders
  .replace(/\{\{POST_TITLE\}\}/g, 'Tool A vs Tool B: Which Is Right for You in 2026?')
  .replace(/\{\{POST_CATEGORY\}\}/g, 'Comparison')
  .replace(/\{\{SITE_NAME\}\}/g, 'YourBlog')
  .replace(/\{\{AUTHOR_NAME\}\}/g, 'Alex Johnson')
  .replace(/\{\{AUTHOR_INITIAL\}\}/g, 'A')
  .replace(/\{\{AUTHOR_BIO\}\}/g, 'Writer and researcher covering productivity tools and software.')
  .replace(/\{\{PUBLISH_DATE\}\}/g, 'April 2026')
  .replace(/\{\{READ_TIME\}\}/g, '8')
  .replace(/\{\{POST_INTRO\}\}/g, 'Choosing the right tool can make or break your workflow. In this guide, we compare the top options side by side so you can make the best decision.')
  .replace(/\{\{POST_INTRO_2\}\}/g, 'We\'ve tested both tools extensively and broken down the key differences across pricing, features, and ease of use.')
  .replace(/\{\{QUICK_ANSWER\}\}/g, 'If you\'re a solo creator, Tool A is the better pick. Teams and power users will get more out of Tool B.')
  .replace(/\{\{OPTION_A\}\}/g, 'Tool A')
  .replace(/\{\{OPTION_B\}\}/g, 'Tool B')
  .replace(/\{\{VERDICT_TITLE\}\}/g, 'Which Should You Choose?')
  .replace(/\{\{VERDICT_BODY\}\}/g, 'Both tools are excellent in their own right. Your choice ultimately depends on your team size, budget, and workflow needs.')
  .replace(/\{\{SECTION_1_TITLE\}\}/g, 'What Is Tool A?')
  .replace(/\{\{SECTION_1_BODY\}\}/g, 'Tool A is a modern productivity platform designed for individuals and small teams. It offers a clean interface with powerful integrations.')
  .replace(/\{\{SECTION_2_TITLE\}\}/g, 'What Is Tool B?')
  .replace(/\{\{SECTION_2_BODY\}\}/g, 'Tool B takes a different approach, focusing on collaboration and scalability. It\'s built for growing teams that need structure.')
  .replace(/\{\{TOC_[0-9]+\}\}/g, 'Section heading')
  .replace(/\{\{COMPARE_[0-9]+\}\}/g, 'Feature')
  .replace(/\{\{PRO_[AB][0-9]+\}\}/g, 'Key advantage of this tool')
  .replace(/\{\{CON_[AB][0-9]+\}\}/g, 'Limitation to consider')
  .replace(/\{\{RELATED_[0-9]+_TITLE\}\}/g, 'Related Article Title')
  .replace(/\{\{RELATED_[0-9]+_DESC\}\}/g, 'A short description of this related post.')
  .replace(/\{\{STEP_([0-9]+)_TITLE\}\}/g, 'Step $1: Complete This Action')
  .replace(/\{\{STEP_[0-9]+_BODY\}\}/g, 'Detailed instructions for completing this step successfully.')
  .replace(/\{\{STEP_[0-9]+_TIP\}\}/g, 'Pro tip: Here\'s a helpful shortcut to save you time.')
  .replace(/\{\{STEP_[0-9]+_WARNING\}\}/g, 'Be careful not to skip this — it\'s easy to miss and can cause issues later.')
  .replace(/\{\{STEP_[0-9]+_CODE\}\}/g, '# Example command\nnpm install your-package --save')
  .replace(/\{\{STEP_[0-9]+_BULLET_[0-9]+\}\}/g, 'Important sub-step to follow')
  .replace(/\{\{PREREQ_[0-9]+\}\}/g, 'Basic requirement or tool needed')
  .replace(/\{\{SUMMARY_HEADLINE\}\}/g, 'What You\'ve Learned')
  .replace(/\{\{SUMMARY_[0-9]+\}\}/g, 'Key takeaway from this guide')
  .replace(/\{\{LIST_([0-9]+)_TITLE\}\}/g, 'Option $1: Great Tool Name')
  .replace(/\{\{LIST_[0-9]+_BODY\}\}/g, 'A reliable and well-regarded option in this category, known for its ease of use and solid feature set.')
  .replace(/\{\{LIST_[0-9]+_PRO_[0-9]+\}\}/g, 'Notable strength of this option')
  .replace(/\{\{LIST_[0-9]+_RATING\}\}/g, '4.5')
  .replace(/\{\{LIST_[0-9]+_REVIEWS\}\}/g, '2,400+')
  .replace(/\{\{LIST_[0-9]+_FEAT_[0-9]+\}\}/g, 'Key feature of this option')
  .replace(/\{\{LIST_[0-9]+_BOTTOM_LINE\}\}/g, 'A solid choice for most users looking for reliability and ease of use.')
  .replace(/\{\{LIST_COUNT\}\}/g, '6')
  .replace(/\{\{CTA_HEADLINE\}\}/g, 'Ready to Get Started?')
  .replace(/\{\{CTA_SUBTEXT\}\}/g, 'Join thousands of people already using the best tools for their workflow.')
  // Comparison article extras
  .replace(/\{\{TLDR_[0-9]+\}\}/g, 'Key insight about these tools to help you decide faster.')
  .replace(/\{\{VERDICT_A\}\}/g, 'you want simplicity and a faster learning curve')
  .replace(/\{\{VERDICT_B\}\}/g, 'you need advanced collaboration and scalability')
  .replace(/\{\{VERDICT_A_[0-9]+\}\}/g, 'Prefer a cleaner, simpler interface')
  .replace(/\{\{VERDICT_B_[0-9]+\}\}/g, 'Need powerful team collaboration features')
  .replace(/\{\{UPDATED_DATE\}\}/g, 'March 2026')
  .replace(/\{\{EVAL_INTRO\}\}/g, 'We spent weeks hands-on testing both tools across six key dimensions.')
  .replace(/\{\{EVAL_[0-9]+_TITLE\}\}/g, 'Evaluation Criterion')
  .replace(/\{\{EVAL_[0-9]+_DESC\}\}/g, 'How each tool performs on this dimension based on our testing.')
  .replace(/\{\{FEATURE_[0-9]+\}\}/g, 'Notable capability of this tool')
  .replace(/\{\{PRICE_[AB]_FREE\}\}/g, 'Free forever')
  .replace(/\{\{PRICE_[AB]_PAID\}\}/g, '$12/month')
  .replace(/\{\{PRICE_[AB]_FEAT_[0-9]+\}\}/g, 'Included in this plan')
  .replace(/\{\{AUTHOR_TITLE\}\}/g, 'Senior Editor')
  .replace(/\{\{SOURCE_[0-9]+\}\}/g, 'Official documentation and product research, 2026.')
  // How-to guide extras
  .replace(/\{\{EST_TIME\}\}/g, '30 min')
  .replace(/\{\{DIFFICULTY\}\}/g, 'Beginner')
  .replace(/\{\{STEP_COUNT\}\}/g, '5')
  .replace(/\{\{STEP_[0-9]+_NOTE\}\}/g, 'Note: Keep this in mind as you proceed through the next steps.')
  .replace(/\{\{STEP_[0-9]+_CODE\}\}/g, '# Example command\nnpm install your-package')
  .replace(/\{\{STEP_[0-9]+_BULLET_[0-9]+\}\}/g, 'Important detail to keep in mind')
  .replace(/\{\{STEP_[0-9]+_TIP\}\}/g, 'Pro tip: This shortcut will save you significant time.')
  .replace(/\{\{TROUBLE_[0-9]+_Q\}\}/g, 'What if something goes wrong at this step?')
  .replace(/\{\{TROUBLE_[0-9]+_A\}\}/g, 'Try restarting the process from step 1. Check that all prerequisites are installed correctly.')
  // Listicle extras
  .replace(/\{\{METHODOLOGY_NOTE\}\}/g, 'We independently tested each option and reviewed thousands of user ratings to compile this list.')
  .replace(/\{\{HOW_TO_CHOOSE_TITLE\}\}/g, 'How to Choose the Right Option')
  .replace(/\{\{HOW_TO_CHOOSE_BODY\}\}/g, 'The best choice depends on your specific needs. Here are the four most important factors to consider:')
  .replace(/\{\{CHOOSE_[0-9]+_TITLE\}\}/g, 'Key Factor')
  .replace(/\{\{CHOOSE_[0-9]+_DESC\}\}/g, 'Consider how this factor affects your specific situation and workflow requirements.')
  // Catch-all
  .replace(/\{\{[A-Z0-9_]+\}\}/g, 'Sample content');
