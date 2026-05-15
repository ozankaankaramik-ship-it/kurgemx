export const PROTOTIP_BASE_CSS = `
/* ── Reset & Base ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #111827; background: #F9FAFB; display: flex; min-height: 100vh; }

/* ── Layout ── */
.sidebar { width: 240px; min-height: 100vh; background: #1F3864; color: #fff; display: flex; flex-direction: column; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow: hidden; }
.main { flex: 1; overflow: auto; min-width: 0; }

/* ── Sidebar ── */
.sidebar-header { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.12); display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.sidebar-logo { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: .3px; }
.sidebar-logo .accent, .sidebar-logo span { color: #7EB3E8; }
.sidebar-nav { flex: 1; padding: 12px 8px; overflow-y: auto; }
.nav-group { margin-bottom: 18px; }
.nav-group-label { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: .8px; color: rgba(255,255,255,.4); padding: 0 8px 6px; }
.nav-item { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; color: rgba(255,255,255,.75); text-decoration: none; transition: background .15s; line-height: 1.4; }
.nav-item:hover { background: rgba(255,255,255,.1); color: #fff; }
.nav-item.active { background: #2E75B6; color: #fff; font-weight: 500; }
.sidebar-footer { padding: 10px 16px; border-top: 1px solid rgba(255,255,255,.12); display: flex; justify-content: space-between; font-size: 10px; color: rgba(255,255,255,.35); flex-shrink: 0; }

/* ── Screen ── */
.screen { display: none; padding: 24px; min-height: 100%; }
.screen-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
.screen-title { font-size: 16px; font-weight: 600; color: #111827; }
.screen-meta { font-size: 12px; color: #6B7280; margin-top: 2px; }
.screen-actions { display: flex; gap: 8px; flex-shrink: 0; }

/* ── Buttons ── */
.btn { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: opacity .15s, background .15s; white-space: nowrap; text-decoration: none; font-family: inherit; }
.btn-primary { background: #1F3864; color: #fff; }
.btn-primary:hover { background: #2E75B6; }
.btn-secondary { background: #fff; color: #1F3864; border: 0.5px solid #2E75B6; }
.btn-secondary:hover { background: #EEF4FB; }
.btn-danger { background: #EF4444; color: #fff; }
.btn-danger:hover { background: #DC2626; }
.btn-sm { height: 28px; padding: 0 10px; font-size: 11px; }
.btn:disabled, .btn[disabled] { opacity: .4; cursor: not-allowed; pointer-events: none; }

/* ── Forms ── */
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 5px; }
.required { color: #EF4444; margin-left: 2px; }
.form-control { width: 100%; height: 38px; padding: 8px 12px; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 13px; color: #111827; background: #fff; outline: none; transition: border .15s; font-family: inherit; }
.form-control:focus { border-width: 2px; border-color: #2E75B6; }
.form-control.error { border-color: #EF4444; }
.form-error { font-size: 11px; color: #EF4444; margin-top: 3px; }
textarea.form-control { height: auto; min-height: 80px; resize: vertical; }
select.form-control { appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px; }
.form-check { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; margin-bottom: 8px; }
.form-check input[type=checkbox], .form-check input[type=radio] { width: 16px; height: 16px; accent-color: #1F3864; cursor: pointer; flex-shrink: 0; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-section { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 12px; padding: 18px 20px; margin-bottom: 12px; }
.form-section-title { font-size: 13px; font-weight: 600; color: #1F3864; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #E5E7EB; }
.form-actions { display: flex; gap: 8px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #E5E7EB; }

/* ── Cards ── */
.card { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 12px; padding: 18px 20px; }
.card + .card { margin-top: 4px; }
.card-title { font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 12px; }

/* ── Tables ── */
.table-wrap { border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; background: #fff; }
table th { background: #1F3864; color: #fff; font-size: 11px; font-weight: 500; padding: 9px 12px; text-align: left; white-space: nowrap; }
table td { padding: 9px 12px; font-size: 13px; border-bottom: 1px solid #E5E7EB; color: #374151; }
table tr:nth-child(even) td { background: #F9FAFB; }
table tr:hover td { background: #EEF4FB; }
table tr:last-child td { border-bottom: none; }
.table-actions { display: flex; gap: 6px; }

/* ── Badges ── */
.badge { display: inline-flex; align-items: center; font-size: 10px; font-weight: 500; padding: 2px 7px; border-radius: 4px; border: 1px solid; white-space: nowrap; }
.badge-r1 { background: #EEF4FB; border-color: #B5D4F4; color: #0C447C; }
.badge-r2 { background: #EAF3DE; border-color: #C0DD97; color: #27500A; }
.badge-r3 { background: #FAEEDA; border-color: #FAC775; color: #633806; }
.badge-pending { background: #FEF3C7; border-color: #FDE68A; color: #92400E; }
.badge-review { background: #EEF4FB; border-color: #BFDBFE; color: #1F3864; }
.badge-done { background: #DCFCE7; border-color: #BBF7D0; color: #166534; }
.badge-rejected { background: #FEE2E2; border-color: #FECACA; color: #991B1B; }
.badge-gray { background: #F3F4F6; border-color: #E5E7EB; color: #6B7280; }

/* ── Stats / Dashboard ── */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
.stat-card { background: #fff; border: 0.5px solid #E5E7EB; border-radius: 10px; padding: 16px; }
.stat-value { font-size: 24px; font-weight: 700; color: #1F3864; }
.stat-label { font-size: 12px; color: #6B7280; margin-top: 2px; }

/* ── Modal ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 12px; padding: 24px; width: min(480px, 90vw); box-shadow: 0 20px 40px rgba(0,0,0,.15); }
.modal-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
.modal-body { font-size: 13px; color: #374151; margin-bottom: 4px; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid #E5E7EB; }

/* ── Toast ── */
.toast-container { position: fixed; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 8px; z-index: 2000; }
.toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,.12); animation: slideIn .2s ease; min-width: 240px; }
.toast-success { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
.toast-error { background: #FEE2E2; color: #991B1B; border: 1px solid #FECACA; }
.toast-info { background: #EEF4FB; color: #1F3864; border: 1px solid #BFDBFE; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

/* ── Utilities ── */
.section-label { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .8px; color: #9CA3AF; margin-bottom: 8px; margin-top: 14px; }
.chart-placeholder { background: #F9FAFB; border: 1px dashed #E5E7EB; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-size: 13px; min-height: 160px; }

/* ── Hamburger ── */
.hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; color: rgba(255,255,255,.8); flex-direction: column; gap: 5px; flex-shrink: 0; }
.hamburger span { display: block; width: 20px; height: 2px; background: currentColor; border-radius: 2px; }

/* ── Responsive ── */
@media (max-width: 1023px) { .sidebar { width: 200px; } }
@media (max-width: 767px) {
  body { flex-direction: column; }
  .sidebar { width: 100%; min-height: auto; position: relative; height: auto; }
  .sidebar-nav { display: none; }
  .sidebar.open .sidebar-nav { display: block; }
  .hamburger { display: flex; }
  .screen { padding: 16px; }
  .form-row { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .table-wrap { overflow-x: auto; }
  .screen-header { flex-direction: column; align-items: flex-start; }
}
`.trim()
