
export function exportMonthlyCsv(
  monthlyData: { month: string; revenue: number; expenses: number; taxes: number; profit: number }[],
  year: number
) {
  const header = ['Mês', 'Receita', 'Despesas', 'Impostos', 'Lucro'];
  const rows = monthlyData.map((m) => [m.month, m.revenue, m.expenses, m.taxes, m.profit]);
  const csv = [header, ...rows]
    .map((r) => r.map((v) => (typeof v === 'number' ? v.toFixed(2).replace('.', ',') : `"${v}"`)).join(';'))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_mensal_${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPdf(
  monthlyData: { month: string; revenue: number; expenses: number; taxes: number; profit: number }[],
  annualData: { year: number; revenue: number; expenses: number; taxes: number; profit: number }[],
  year: number
) {
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!w) return;
  const style = `
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; }
      h1, h2 { margin: 0 0 8px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: right; }
      th:first-child, td:first-child { text-align: left; }
      .muted { color: #666; font-size: 12px; }
      .section { margin-top: 24px; }
    </style>
  `;
  const monthlyRows = monthlyData
    .map(
      (m) =>
        `<tr><td>${m.month}</td><td>${fmt(m.revenue)}</td><td>${fmt(m.expenses)}</td><td>${fmt(m.taxes)}</td><td>${fmt(
          m.profit
        )}</td></tr>`
    )
    .join('');
  const annualRows = annualData
    .map(
      (r) =>
        `<tr><td>${r.year}</td><td>${fmt(r.revenue)}</td><td>${fmt(r.expenses)}</td><td>${fmt(r.taxes)}</td><td>${fmt(
          r.profit
        )}</td></tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Relatórios Financeiros</title>
        ${style}
      </head>
      <body>
        <h1>Relatórios Financeiros</h1>
        <div class="muted">Gerado em ${new Date().toLocaleString('pt-BR')}</div>

        <div class="section">
          <h2>Relatório Mensal (${year})</h2>
          <table>
            <thead>
              <tr><th>Mês</th><th>Receita</th><th>Despesas</th><th>Impostos</th><th>Lucro</th></tr>
            </thead>
            <tbody>${monthlyRows}</tbody>
          </table>
        </div>

        <div class="section">
          <h2>Relatório Anual</h2>
          <table>
            <thead>
              <tr><th>Ano</th><th>Receita</th><th>Despesas</th><th>Impostos</th><th>Lucro</th></tr>
            </thead>
            <tbody>${annualRows}</tbody>
          </table>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `;
  w.document.write(html);
  w.document.close();
}

function fmt(v: number) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`;
}

