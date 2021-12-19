<template>
  <div>
    <h1>Введите ваш поисковый запрос</h1>
    <el-input v-model="input" placeholder="Поисковый запрос" />
    <el-button class="scan-btn" type="primary" @click="scan()"
      >Сканировать</el-button
    >
    <el-button v-if="items.length > 0" type="primary" @click="exportAsCsv()">Экспорт в Excel</el-button>
    <el-button v-if="items.length > 0" type="primary" @click="exportAsJson()">Экспорт в JSON</el-button>
    <el-button type="primary" @click="dialogVisible = true">Конфигурация</el-button>

    <div class="results" v-if="items.length > 0">
      Результаты запроса: {{ items.length }} ссылок
    </div>

    <div class="item-cards">
      <div class="item-card" v-for="card in items" :key="card.id">
        <h3>{{ card.title }}</h3>
        <h5>{{ card.prices }} руб.</h5>
        <el-button type="primary" @click="goto(card.href)">
          {{ card.domain || "[не известно]" }}
        </el-button>
      </div>
    </div>

    <el-dialog
    v-model="dialogVisible"
    title="Конфигурация"
    :before-close="handleClose"
  >
    <div class="settings">
      <el-checkbox v-model="scanTitle" label="Сканировать название товара"></el-checkbox>
      <el-checkbox v-model="scanPrice" label="Сканировать цену товара"></el-checkbox>
      <el-checkbox v-model="scanAd" label="Сканировать рекламу выдачи поисковых результатов Google"></el-checkbox>
      <el-checkbox v-model="scanFirst" label="Сканирование только первого товара на сайте"></el-checkbox>
    </div>
  </el-dialog>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
  data() {
    return {
      input: "",
      items: [],
      dialogVisible: false,
      scanTitle: localStorage.getItem('title') === 'true',
      scanPrice: localStorage.getItem('price') === 'true',
      scanAd: localStorage.getItem('ad') === 'true',
      scanFirst: localStorage.getItem('first') === 'true',
    };
  },
  watch: {
    scanTitle: function (newVal) {
      localStorage.setItem('title', newVal);
    },
    scanPrice: function (newVal) {
      localStorage.setItem('price', newVal);
    },
    scanAd: function (newVal) {
      localStorage.setItem('ad', newVal);
    },
    scanFirst: function (newVal) {
      localStorage.setItem('first', newVal);
    },
  },
  methods: {
    goto(ref) {
      window.open(ref, "_blank");
    },
    getScanSettings() {
      return {
        scanTitle: localStorage.getItem('title'),
        scanPrice: localStorage.getItem('price'),
        scanAd: localStorage.getItem('ad'),
        scanFirst: localStorage.getItem('first'),
      };
    },
    exportAsCsv() {},
    exportAsJson() {
      const data = JSON.stringify(this.items, null, '\t')
      const blob = new Blob([data], {type: 'text/plain'})
      const e = document.createEvent('MouseEvents'),
      a = document.createElement('a');
      a.download = `exported-${this.input}.json`;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
    },
    scan() {
      const scanSettings = this.getScanSettings();
      fetch('http://localhost:3030/scan', {
        method: 'POST',
        body: JSON.stringify({searchString: this.input, scanSettings}),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(result => this.items = result.map(r => ({...r, prices: r.prices.join(', ')})));
    },
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.scan-btn {
  margin-top: 10px !important;
}

.item-cards {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.item-card {
  margin: 10px;
  padding: 10px;
  border: 1px solid lightgray;
  flex: 1 1 0px;
  min-width: 200px;
}

.results {
  margin-top: 5px;
}

.settings {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.el-checkbox {
  display: block;
}
</style>
