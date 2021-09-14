const GITHUB = 'https://api.github.com'
const TITLE = 'Automatic Error Report';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});


async function handleRequest(request) {
  if (request.method === 'POST') {
    const obj = await request.json();
    const headers = {
      'User-Agent': 'Mozilla/5.0 ErrorReporter (github.com/Seggan/ErrorReporter)',
      Accept: 'application/vnd.github.v3.raw+json',
      Authorization: `token ${await DATA.get('gh_token')}`
    };

    if (!obj.Hashcode) {
      return new Response('Hashcode not specified', { status: 400 });
    }

    let b = '';
    for (const key in obj) {
      b += `# ${key}
      ${obj[key]}\n`;
    }

    const urlstr = `${GITHUB}/repos/${request.headers.get('User')}/${request.headers.get('Repo')}/issues`;
    const url = new URL(urlstr);

    url.search = new URLSearchParams({
      state: 'open',
      creator: 'SegganBot'
    }).toString();

    const issuesResponse = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    if (issuesResponse.status === 404) {
      return new Response('User/Repo not found', { status: 404 });
    }
    const issues = await issuesResponse.json();

    const look = `# Hashcode
    ${obj.Hashcode}\n`;
    for (const issue of issues) {
      if (!('pull_request' in issue) && issue.title === TITLE && issue.body.includes(look)) {
        return new Response('Duplicate Issue');
      }
    }

    const response = await fetch(urlstr, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        title: TITLE,
        body: b
      })
    });

    if (response.status === 400) {
      return new Response('Server error', { status: 500 });
    }

    return new Response(await response.text(), { status: response.status });
  } else {
    return new Response('Expected POST', { status: 400 });
  }
}
