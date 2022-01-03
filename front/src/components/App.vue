<template>
  <div>
    <h1>Введите ваш поисковый запрос</h1>
    <el-input v-model="searchStr" placeholder="Поисковый запрос" />

    <ToolBar
      @scan-start="scanStart"
      @scan-stop="scanStop"
      :searchStr="searchStr"
    ></ToolBar>

    <div class="progress" v-if="scanRunning">
      {{ scanProgressMsg }}
      <el-progress
        :text-inside="true"
        :stroke-width="26"
        color="#0d84ff"
        :percentage="scanProgressPercentage"
      >
        {{ scanProgressPercentage }}%
      </el-progress>
    </div>

    <div class="results" v-if="items.length > 0 && !scanRunning">
      Результаты запроса: {{ items.length }} ссылок
    </div>

    <CardList v-if="!scanRunning" :items="items"></CardList>
  </div>
</template>

<script>
import CardList from "./CardList.vue";
import ToolBar from "./ToolBar.vue";
import { API } from "../utils/Api";

export default {
  name: "App",
  components: { CardList, ToolBar },
  data() {
    return {
      searchStr: "",
      items: [],

      scanRunning: false,
      scanProgressMsg: "",
      scanProgressPercentage: 0,
    };
  },
  mounted() {
    const ws = new WebSocket("ws://localhost:3030?key=" + API.wsKey);

    ws.onopen = () => ws.send("smth");
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const wsType = data.type;
      switch (wsType) {
        case "progress":
          this.scanProgressMsg = data.msg;
          this.scanProgressPercentage = data.percentage;
          break;
      }
    };
  },
  methods: {
    scanStart() {
      this.scanRunning = true;
      this.scanProgressPercentage = 0;
    },
    scanStop(value) {
      this.items = value;
      this.scanRunning = false;
      this.scanProgressPercentage = 0;
    },
  },
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

.results {
  margin-top: 5px;
}

.progress {
  margin: 20px;
}

.hidden {
  display: none;
}
</style>
