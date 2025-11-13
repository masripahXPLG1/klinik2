function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Simpan dan muat data ke localStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function loadData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

/**
 * Fungsi umum untuk setup tabel
 */
function setupTable(formId, tableId, fieldIds, buttonId, storageKey) {
  const form = document.getElementById(formId);
  const tableBody = document.querySelector(`#${tableId} tbody`);
  const tambahBtn = document.getElementById(buttonId);
  let editRow = null;
  let dataList = loadData(storageKey);

  renderTable();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const values = fieldIds.map(id => document.getElementById(id).value.trim());
    if (values.some(v => v === "")) {
      alert("Isi semua kolom dulu ya 😊");
      return;
    }

    if (editRow !== null) {
      dataList[editRow] = values;
      editRow = null;
      tambahBtn.textContent = "Tambah";
    } else {
      dataList.push(values);
    }

    saveData(storageKey, dataList);
    form.reset();
    renderTable();
    updateDropdowns();
  });

  function renderTable() {
    tableBody.innerHTML = "";
    dataList.forEach((values, i) => {
      const row = document.createElement("tr");
      let html = `<td>${i + 1}</td>`;
      values.forEach(v => html += `<td>${v}</td>`);
      html += `
        <td>
          <button type="button" class="edit-btn">Edit</button>
          <button type="button" class="hapus-btn">Hapus</button>
        </td>`;
      row.innerHTML = html;
      tableBody.appendChild(row);
    });
    refreshEvents();
  }

  function refreshEvents() {
    tableBody.querySelectorAll(".edit-btn").forEach((btn, i) => {
      btn.onclick = function () {
        const item = dataList[i];
        fieldIds.forEach((id, idx) => {
          document.getElementById(id).value = item[idx];
        });
        tambahBtn.textContent = "Simpan Perubahan";
        editRow = i;
      };
    });

    tableBody.querySelectorAll(".hapus-btn").forEach((btn, i) => {
      btn.onclick = function () {
        dataList.splice(i, 1);
        saveData(storageKey, dataList);
        renderTable();
        updateDropdowns();
      };
    });
  }

  return {
    getData: () => dataList
  };
}

// Setup semua tabel
const dokterTable = setupTable("formDokter", "tabelDokter", ["namaDokter", "spesialis"], "btnDokter", "dataDokter");
const pasienTable = setupTable("formPasien", "tabelPasien", ["namaPasien", "umurPasien"], "btnPasien", "dataPasien");
const penyakitTable = setupTable("formPenyakit", "tabelPenyakit", ["namaPenyakit"], "btnPenyakit", "dataPenyakit");
const rawatJalanTable = setupTable("formRawatJalan", "tabelRJ", ["namaRJ", "dokterRJ", "penyakitRJ", "kelasRJ", "tanggalRJ"], "btnRJ", "dataRJ");
const rawatInapTable = setupTable("formRawatInap", "tabelRI", ["namaRI", "dokterRI", "penyakitRI", "kelasRI", "tanggalRI"], "btnRI", "dataRI");

// Update dropdown dokter dan penyakit secara dinamis
function updateDropdowns() {
  const dokterList = dokterTable.getData().map(item => item[0]);
  const penyakitList = penyakitTable.getData().map(item => item[0]);

  function isiSelect(idSelect, dataList) {
    const select = document.getElementById(idSelect);
    const selected = select.value;
    select.innerHTML = '<option value="">Pilih</option>';
    dataList.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      select.appendChild(opt);
    });
    if (dataList.includes(selected)) select.value = selected;
  }

  isiSelect("dokterRJ", dokterList);
  isiSelect("penyakitRJ", penyakitList);
  isiSelect("dokterRI", dokterList);
  isiSelect("penyakitRI", penyakitList);
}

// Jalankan saat awal dan setiap 2 detik
updateDropdowns();
setInterval(updateDropdowns, 2000);
