self.onmessage = async (event) => {
  const { folderPath } = event.data;
  self.postMessage({ type: 'progress', value: 10, message: 'Preparing ingestion pipeline...' });
  await new Promise((r) => setTimeout(r, 200));
  self.postMessage({ type: 'progress', value: 35, message: 'Extracting text + entities...' });
  await new Promise((r) => setTimeout(r, 200));
  self.postMessage({ type: 'progress', value: 70, message: 'Computing clusters + city layout...' });
  const response = await fetch('/api/import', { method: 'POST', body: JSON.stringify({ folderPath }) });
  const data = await response.json();
  self.postMessage({ type: 'done', value: 100, data });
};
