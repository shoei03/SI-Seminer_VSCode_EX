export async function callAPI(precode: string) {
    const res = await fetch(`http://127.0.0.1:8000/${precode}`);
    const data = await res.json();
    return data;
}
