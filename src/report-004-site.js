(() => {
  const cubsRoute='reports/cubs/index.html';
  function addCubsQuestions(){
    const rail=document.querySelector('.story-question-rail');
    if(!rail||rail.querySelector('[data-report="cubs"]'))return;
    for(const [hash,text] of [['peak','Was 2016 really that dominant?'],['development','Why did the farm stop replenishing the roster?']]){
      const a=document.createElement('a');a.href=`${cubsRoute}#${hash}`;a.dataset.report='cubs';a.innerHTML=`<b>CUBS</b><span>${text}</span>`;rail.append(a);
    }
  }
  function polishHomepage(){
    addCubsQuestions();
    const note=document.querySelector('.authentic-note');
    if(note&&note.textContent.includes('4 published stories'))note.innerHTML='<strong>Real history, real photography.</strong> Era Theory now has 4 published stories across the NFL, NBA and MLB. Real people use rights-reviewed source photography, never AI stand-ins.';
  }
  function polishResearchHub(){
    const modelIntro=document.querySelector('#model .research-intro');
    if(modelIntro)modelIntro.textContent='Era Theory does not force every sport into one scorecard. Reports 001 and 002 use the seven-dimension NFL front-office model; Report 003 uses an eight-dimension NBA core/conversion model; Report 004 uses an eight-dimension MLB rebuild-lifecycle model. Every report publishes its weights and stress tests.';
    const sourceLines=document.querySelector('#sources .source-lines');
    if(sourceLines&&!sourceLines.querySelector('[data-report="cubs"]')){
      const article=document.createElement('article');article.dataset.report='cubs';article.innerHTML='<h3>MLB Report 004</h3><p>MLB.com/Cubs official history and transaction records, Baseball Reference season records and a rights-reviewed authentic Cubs photo archive.</p><a href="cubs/index.html">Open Cubs methodology →</a>';sourceLines.append(article);
    }
    const counter=document.querySelector('.counterexample-box');
    if(counter)counter.innerHTML='<h3>Can reasonable priorities change the conclusion?</h3><p>Yes. The Pacers winner changes under durability/resilience-heavy priorities. The Cubs lifecycle score also moves under title-first, dynasty-first and development-heavy models—but no bounded plausible model reaches the 90-point dynasty threshold. Era Theory reports fragility instead of hiding it.</p>';
  }
  let passes=0;
  const timer=setInterval(()=>{
    polishHomepage();polishResearchHub();
    passes+=1;if(passes>=20)clearInterval(timer);
  },100);
  document.addEventListener('DOMContentLoaded',()=>{polishHomepage();polishResearchHub();});
})();
