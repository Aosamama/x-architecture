/* X Architecture — site settings.
   api: the Google Apps Script web-app URL (ends with /exec). While it is empty the
   registration feature stays off (visit /#join to preview the form). See backend/SETUP.md
   render: the Cloudflare Worker URL of the AI render studio. While it is empty the studio shows "Coming soon".
   See backend/render-worker/SETUP.md
   The studio is paused ("Coming soon") until the render quality is improved. To turn it back on, put the Worker URL back:
   render: 'https://xarch-render.osama-architects.workers.dev' */
window.XCFG = { api: 'https://script.google.com/macros/s/AKfycbzguN3NRLLDSyKaturRce274lPCNuAxJDNzG80xiy28FxnaqfKe-PpO8RG-ugqwMb_8sQ/exec', render: '' };
