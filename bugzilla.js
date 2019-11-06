let root = document.getElementById('entries');
let exceptions_storage = null;

function isMozilla(name) {
  if (name.match(/(mozilla.org|mozilla.com)$/)) {
    return true;
  }
  return false;
}

function isPaid(name) {
  return isMozilla(name) || (exceptions_storage && exceptions_storage.indexOf(name) > -1);
}

function addContributor(bugs, name, source) {
  let tr = document.createElement('tr');

  let tdName = document.createElement('td');
  let aName = document.createElement('a');
  aName.innerText = name;
  aName.href = `https://bugzilla.mozilla.org/user_profile?login=${name}`;
  tdName.appendChild(aName);

  let tdBugs = document.createElement('td');
  tdBugs.className = "bugs";
  for (let bug of bugs) {
    let aBug = document.createElement('a');
    aBug.innerText = bug;
    aBug.className = 'label label-default bug';
    aBug.href = `https://bugzilla.mozilla.org/show_bug.cgi?id=${bug}`;
    tdBugs.appendChild(aBug);
  }

  let tdPaid = document.createElement('td');
  let paid = isPaid(name);
  let aPaid = document.createElement('a');
  aPaid.innerText = paid ? (isMozilla(name) ? 'MOZILLA' : 'YES') : 'NO';
  aPaid.className = paid ? (isMozilla(name) ? 'label label-info mozilla' : 'label label-primary paid') : 'label label-success contributor';
  aPaid.dataset.name = name;
  aPaid.dataset.paid = paid;
  aPaid.addEventListener('click', toggle);

  tdPaid.appendChild(aPaid);

  tr.className = paid ? (isMozilla(name) ? 'mozilla' : 'paid') : 'contributor';

  tr.appendChild(tdName);
  tr.appendChild(tdPaid);
  tr.appendChild(tdBugs);
  root.appendChild(tr);
}

function toggle(event) {
  let name = event.target.dataset.name;
  let paid = event.target.dataset.paid;

  if (isMozilla(name)) {
    event.preventDefault();
    return;
  }
  browser.storage.local.get('exceptions')
  .then(res => {
    if (!res.exceptions) {
      res.exceptions = [];
    }

    if (paid === 'false' && res.exceptions.indexOf(name) < 0) {
      res.exceptions.push(name);
    }

    if (paid === 'true' && res.exceptions.indexOf(name) > -1) {
      res.exceptions.splice(res.exceptions.indexOf(name), 1);
    }

    exceptions_storage = null;
    browser.storage.local.set({exceptions: res.exceptions})
    .then(_ => {
      window.location.reload();
    });
  });
}

function findContributors(tabId) {
  return browser.storage.local.get('exceptions')
  .then(response => {
    exceptions_storage = response.exceptions || null;
  }).then(_ => {
    return browser.tabs.sendMessage(tabId, {query: 'contributors'})
    .then(response => {
      response.contributors.forEach(addContributor);
      document.getElementById('total').innerText = document.getElementsByClassName('contributor').length;
    });
  });
}

function sortContributors() {
  const order = ["contributor", "paid", "mozilla"];
  let nodes = [...root.children].sort((a, b) => {
    let sort = order.indexOf(a.className) - order.indexOf(b.className);
    if (sort != 0) {
      return sort;
    }

    return b.querySelector("td.bugs").children.length - a.querySelector("td.bugs").children.length;
  });

  for (let node of nodes) {
    root.appendChild(node);
  }
}

document.getElementById('return').addEventListener('click', event => {
  browser.tabs.update(tabId, {active: true});
});

let url = new URL(window.location);
let tabId = parseInt(url.searchParams.get('tabId'));
findContributors(tabId).then(() => sortContributors());
