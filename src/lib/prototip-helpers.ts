import { genel, prototip as prototipStandart } from '@/lib/standartlar'

export interface HikayeItem {
  no: string; ad: string; destan: string; surum: string; sprint: string
}

const SISTEM_EK = `

Minimal ve sade HTML üret.
Gereksiz CSS animasyonu ekleme.
JavaScript sadece navigasyon ve form simülasyonu için kullan.`

export const SISTEM = `${genel}\n\n${prototipStandart}${SISTEM_EK}`

export const SHARED_NAV_JS = `<script>
(function(){
  function showScreen(id){
    document.querySelectorAll('.screen').forEach(function(s){s.style.display='none';});
    var el=document.getElementById(id);if(el)el.style.display='block';
    document.querySelectorAll('[data-screen]').forEach(function(n){n.classList.remove('active');});
    var nav=document.querySelector('[data-screen="'+id+'"]');if(nav)nav.classList.add('active');
  }
  window.showScreen=showScreen;
  document.addEventListener('DOMContentLoaded',function(){
    var screens=document.querySelectorAll('.screen');
    screens.forEach(function(s){s.style.display='none';});
    if(screens.length>0){
      var first=screens[0];first.style.display='block';
      var n=document.querySelector('[data-screen="'+first.id+'"]');if(n)n.classList.add('active');
    }
    document.querySelectorAll('[data-screen]').forEach(function(nav){
      nav.addEventListener('click',function(e){
        e.preventDefault();var sid=nav.getAttribute('data-screen');if(sid)showScreen(sid);
      });
    });
  });
})();
</script>`

export function extractScreenIds(html: string): string[] {
  const ids: string[] = []
  const re = /<!--\s*SCREEN_CONTENT_([A-Za-z0-9_-]+)\s*-->/g
  let m
  while ((m = re.exec(html)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1])
  }
  return ids
}

export function extractScreenName(skeleton: string, screenId: string): string {
  const re = new RegExp(`data-screen=["']${screenId}["'][^>]*>\\s*([^<]+)`, 'i')
  const m = skeleton.match(re)
  return m ? m[1].trim() : screenId
}

export function extractSkeletonCSS(skeleton: string): string {
  const m = skeleton.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
  return m ? m[1].trim() : ''
}

export function buildHikayelerMetni(
  hikayeler: HikayeItem[],
  positiveAcler: Record<string, string[]>,
  isTR: boolean,
): string {
  return hikayeler
    .map(h => {
      const aclar = positiveAcler[h.no]
      const acMetni = aclar?.length ? `\n  Positive ACs: ${aclar.join(' | ')}` : ''
      return `- ${h.no} | ${h.ad} | ${isTR ? 'Destan' : 'Epic'}: ${h.destan} | ${h.surum} | ${h.sprint}${acMetni}`
    })
    .join('\n')
}
