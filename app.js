(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const KEY = 'team_vote_polls';

  // ---- storage ----
  function load() { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }
  function find(id) { return load().find((p) => p.id === id); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  // ---- panels ----
  function show(id) {
    $$('.panel').forEach((p) => p.classList.remove('active'));
    $(`#${id}`).classList.add('active');
  }

  // ---- render list ----
  function renderList() {
    const polls = load();
    const box = $('#pollList');
    $('#emptyMsg').style.display = polls.length ? 'none' : '';
    box.innerHTML = polls.map((p) => {
      const total = p.options.reduce((s, o) => s + o.votes, 0);
      return `<div class="poll-card" data-id="${p.id}">
        <div><h3>${esc(p.title)}</h3><div class="info">${p.options.length} 个选项 · ${total} 票</div></div>
        <span class="badge">${total} 票</span>
      </div>`;
    }).join('');
    box.querySelectorAll('.poll-card').forEach((card) => {
      card.addEventListener('click', () => openPoll(card.dataset.id));
    });
  }

  // ---- create ----
  function openCreate() {
    show('panelCreate');
    $('#createForm').reset();
    $('#createError').textContent = '';
    // reset options
    $('#optionsBox').innerHTML = `
      <div class="option-row"><input type="text" placeholder="选项 1" required maxlength="80" /><button class="btn-remove" type="button">✕</button></div>
      <div class="option-row"><input type="text" placeholder="选项 2" required maxlength="80" /><button class="btn-remove" type="button">✕</button></div>`;
    bindRemoveBtns();
  }

  function addOptionRow() {
    const n = $('#optionsBox').children.length + 1;
    const div = document.createElement('div');
    div.className = 'option-row';
    div.innerHTML = `<input type="text" placeholder="选项 ${n}" required maxlength="80" /><button class="btn-remove" type="button">✕</button>`;
    $('#optionsBox').appendChild(div);
    bindRemoveBtns();
  }

  function bindRemoveBtns() {
    $('#optionsBox').querySelectorAll('.btn-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rows = $('#optionsBox').children;
        if (rows.length <= 2) return;
        btn.closest('.option-row').remove();
      });
    });
  }

  $('#btnNew').addEventListener('click', openCreate);
  $('#btnAddOption').addEventListener('click', addOptionRow);
  $('#btnCancelCreate').addEventListener('click', () => show('panelList'));

  $('#createForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('#inputTitle').value.trim();
    const inputs = $('#optionsBox').querySelectorAll('input[type=text]');
    const options = [];
    let err = '';
    if (!title) { err = '请输入议题标题。'; }
    inputs.forEach((inp) => {
      const v = inp.value.trim();
      if (!v) err = '选项不能为空。';
      else if (options.includes(v)) err = '选项不能重复。';
      else options.push(v);
    });
    if (options.length < 2) err = '至少需要 2 个选项。';
    if (err) { $('#createError').textContent = err; return; }

    const polls = load();
    polls.push({ id: uid(), title, options: options.map((o) => ({ text: o, votes: 0 })), createdAt: Date.now() });
    save(polls);
    renderList();
    show('panelList');
  });

  // ---- vote page ----
  let currentId = null;

  function openPoll(id) {
    currentId = id;
    const p = find(id);
    if (!p) return;
    $('#voteTitle').textContent = p.title;
    const total = p.options.reduce((s, o) => s + o.votes, 0);
    $('#voteMeta').innerHTML = `<strong>${p.options.length}</strong> 个选项 · 已投 <strong>${total}</strong> 票`;

    const voted = localStorage.getItem(`voted_${id}`);
    const fs = $('#voteOptions');
    fs.innerHTML = p.options.map((o, i) =>
      `<label class="vote-option ${voted ? 'voted' : ''}" data-index="${i}">
        <input type="radio" name="choice" value="${i}" ${voted ? 'disabled' : ''} />
        <span>${esc(o.text)}</span>
      </label>`
    ).join('');

    if (voted) {
      $('#voteForm').style.display = 'none';
      showResults(p);
    } else {
      $('#voteForm').style.display = '';
      $('#voteResults').innerHTML = '';
    }
    show('panelVote');
  }

  $('#voteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const choice = document.querySelector('input[name=choice]:checked');
    if (!choice) { $('#voteError').textContent = '请选择一个选项。'; return; }
    $('#voteError').textContent = '';

    const polls = load();
    const p = polls.find((x) => x.id === currentId);
    if (!p) return;
    p.options[Number(choice.value)].votes++;
    save(polls);
    localStorage.setItem(`voted_${currentId}`, '1');

    // re-render
    $('#voteForm').style.display = 'none';
    $$('#voteOptions .vote-option').forEach((el) => el.classList.add('voted'));
    showResults(p);
  });

  function showResults(p) {
    const total = p.options.reduce((s, o) => s + o.votes, 0);
    const max = Math.max(1, total);
    $('#voteResults').innerHTML = `<div class="results">${p.options.map((o) => {
      const pct = total > 0 ? ((o.votes / total) * 100).toFixed(1) : '0.0';
      return `<div class="result-bar">
        <div class="label"><span>${esc(o.text)}</span><span>${o.votes} 票（${pct}%）</span></div>
        <div class="track"><div class="fill" style="width:${(o.votes / max) * 100}%"></div></div>
      </div>`;
    }).join('')}</div>`;
  }

  $('#btnBack').addEventListener('click', () => { renderList(); show('panelList'); });

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // init
  renderList();
})();