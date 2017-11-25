function checkValid() {
  let found_assignee = false;
  if (document.getElementById('login_link_top')) {
    return found_assignee;
  }

  let table_header = document.getElementsByClassName('sortable_column_');
  for (let element of table_header) {
    if (element.innerText.match(/Assignee/)) {
      found_assignee = true;
    }
  }

  return found_assignee;
}

function getContributors() {
  let assignees = new Map();
  let elements = document.getElementsByClassName('bz_assigned_to_column');
  for (let element of elements) {
    let key = element.innerText;
    let existing = assignees.get(key) || [];
    existing.push(element.parentNode.getElementsByClassName('bz_id_column')[0].innerText);
    assignees.set(key, existing);
  }

  return assignees;
}

function handler(request, sender) {
  if (request.query === 'isValid') {
    return Promise.resolve({isValid: checkValid()});
  }
  if (request.query === 'contributors') {
    return Promise.resolve({contributors: getContributors()});
  }
}

browser.runtime.onMessage.addListener(handler);
