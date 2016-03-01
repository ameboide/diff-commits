// ==UserScript==
// @name        Git Diff Commits
// @namespace   ameboide
// @include     https://bitbucket.org/*
// @include     https://github.com/*
// @version     1.2
// @grant       none
// ==/UserScript==

var stuff = {
  bitbucket: {
    url: function(from, to){ return url + '.git/branches/compare/' + to + '..' + from + '?w=1&ts=2#diff' },
    button_class: 'aui-lozenge',
    link_selector: 'a[href*="/commits/"]',
    branch_counter_selector: '.branches-list .value',
    base_branch_selector: '.main-branch',
    branch_behind_selector: '.behind'
  },
  github: {
    url: function(from, to){ return url + '/compare/' + from + '...' + to + '?w=1&ts=2' },
    button_class: 'btn btn-outline',
    link_selector: 'a.sha',
    branch_counter_selector: '.branch-summary .count-value',
    base_branch_selector: '.default-label',
    branch_behind_selector: '.count-behind'
  }
};
var site_stuff = stuff[document.location.href.match(/\/\/(\w+)/)[1]];

var from = null;
var url = document.location.href.replace(/(:\/(\/[^\/]+){3})(.+)/, '$1').replace('.git', '');

var style = document.createElement('style');
style.innerHTML = '.diff-from { background-color: green; }' +
  '.commit-list td.hash, .commit-list td.hash > div { width: 110px; }';
document.body.appendChild(style);

function setCommit(event){
  var button = event.target;
  var c = button.getAttribute('data-commit');
  if(!from){
    from = c;
    button.classList.add('diff-from');
    return;
  }
  if(c != from) window.open(site_stuff.url(from, c));
  from = null;
  document.querySelector('.diff-from').classList.remove('diff-from');
}

function addBranchLinks(){
  if(!site_stuff.branch_counter_selector) return ;
  var counters = document.querySelectorAll(site_stuff.branch_counter_selector + ':not(.diff-parsed)');
  if(!counters.length) return;
  var base_branch = document.querySelector(site_stuff.base_branch_selector).closest('[data-branch-name]').dataset.branchName;
  for(var i = 0; i < counters.length; i++){
    var counter = counters[i];
    counter.classList.add('diff-parsed');
    var branch = counter.closest('[data-branch-name]').dataset.branchName;
    var u = counter.closest(site_stuff.branch_behind_selector) ?
      site_stuff.url(branch, base_branch) :
      site_stuff.url(base_branch, branch);
    counter.innerHTML = '<a href="' + u + '">' + counter.innerHTML + '</a>';
  }
}

function addCommitButtons(){
  var links = document.querySelectorAll(site_stuff.link_selector + ':not(.diff-parsed)');
  if(links.length < 2) return;
  for(var i = 0; i < links.length; i++){
    var link = links[i];
    link.classList.add('diff-parsed');
    var m = link.href.match(/commits?\/(\w{40})(\?|$)/);
    if(!m) continue;

    var button = document.createElement('span');
    button.textContent = 'D';
    button.className = site_stuff.button_class;
    button.setAttribute('data-commit', m[1]);
    button.addEventListener('click', setCommit);

    link.parentNode.insertBefore(button, link.nextElementSibling);
  }
}

function addButtons(){
  addCommitButtons();
  addBranchLinks();
}

setInterval(addButtons, 1000);
