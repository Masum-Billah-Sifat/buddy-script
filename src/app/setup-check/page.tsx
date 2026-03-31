async function getDb() {
  const res = await fetch("http://localhost:3000/api/test-db", {
    cache: "no-store",
  });
  return res.json();
}

async function getUpload() {
  const res = await fetch("http://localhost:3000/api/test-upload", {
    cache: "no-store",
  });
  return res.json();
}

export default async function SetupCheckPage() {
  const db = await getDb();
  const upload = await getUpload();

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Setup Check</h1>

      <div>
        <h2 className="font-semibold">Database</h2>
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(db, null, 2)}</pre>
      </div>

      <div>
        <h2 className="font-semibold">Cloudinary</h2>
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(upload, null, 2)}</pre>
        {upload?.url ? (
          <img src={upload.url} alt="upload test" className="w-64 rounded border" />
        ) : null}
      </div>
    </main>
  );
}