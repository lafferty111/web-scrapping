<template>
  <div class="btns">
    <el-button class="scan-btn" type="primary" @click="scan()">
      Сканировать
    </el-button>
    <el-button class="scan-btn" type="primary" @click="scanFromFile()">
      Сканировать с файла
      <input type="file" ref="fileUpload" class="hidden" />
    </el-button>
    <el-button class="scan-btn" type="primary" @click="scanUrls()">
      Сканировать с ссылок
    </el-button>
    <el-button v-if="items.length > 0" type="primary" @click="exportAsCsv()">
      Экспорт в Excel
    </el-button>
    <el-button v-if="items.length > 0" type="primary" @click="exportAsJson()">
      Экспорт в JSON
    </el-button>
    <el-button type="primary" @click="configDialog = true">
      Конфигурация
    </el-button>

    <ScanFromUrls
      @on-scan="onScan"
      @scan-start="scanStart"
      @scan-stop="scanStop"
      :show="scanFromUrls"
      @close="closeScanFromUrlDialog"
    ></ScanFromUrls>

    <el-dialog v-model="scanFromFileDialog" title="Сканирование с файла">
      <el-input
        placeholder="Название товара"
        v-model="scanSearchStr"
      ></el-input>
      <el-autocomplete
        v-model="domain"
        class="autocomplete"
        :fetch-suggestions="querySearch"
        placeholder="Домен сайта"
        @select="handleSelect"
      ></el-autocomplete>
      <el-input
        placeholder="Селектор для цены"
        v-model="priceSelector"
      ></el-input>
      <el-input
        placeholder="Селектор для названия товара"
        v-model="titleSelector"
      ></el-input>
      <el-button type="primary" @click="pickFileAndScan()"
        >Выбрать файл и сканировать</el-button
      >
    </el-dialog>

    <Configuration
      :dialogVisible="configDialog"
      @change-dialog-visible="(value) => (configDialog = value)"
      @change-rules="(_rules) => (rules = _rules)"
    ></Configuration>

    <ErrorDialog
      :title="errorTitle"
      :msg="errorMsg"
      :show="isError"
      @close="closeErrorDialog"
    ></ErrorDialog>
  </div>
</template>

<script>
import { API } from "../utils/Api";
import { Utils } from "../utils/Utils";
import ScanFromUrls from "./ScanFromUrls.vue";
import ErrorDialog from "./ErrorDialog.vue";
import Configuration from "./Configuration.vue";
import { ConfigStorage } from "../utils/ConfigStorage";

export default {
  name: "ToolBar",
  components: { ErrorDialog, Configuration, ScanFromUrls },
  mounted() {
    this.$refs.fileUpload.onchange = (event) => {
      const files = event.target.files;

      if (files.length === 0) return;

      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.scanContent(e.target.result);
        this.$refs.fileUpload.value = null;
      };
      reader.readAsText(file);
    };
  },
  watch: {
    items(value) {
      this.$emit("change-items", value);
    },
    domain(value) {
      const rule = ConfigStorage.getRuleByDomain(value);
      if (rule && rule.domain) {
        this.priceSelector = rule.priceSelector;
        this.titleSelector = rule.titleSelector;
      } else {
        this.priceSelector = "";
        this.titleSelector = "";
      }
    },
  },
  props: {
    searchStr: {
      type: String,
      default: () => "",
    },
  },
  data() {
    return {
      items: [],
      result: [],
      rules: [],

      errorTitle: "",
      errorMsg: "",
      isError: false,

      scanFromUrls: false,

      configDialog: false,
      scanFromFileDialog: false,
      domain: "",
      scanSearchStr: "",
      priceSelector: "",
      titleSelector: "",
    };
  },
  methods: {
    exportAsCsv() {
      Utils.downloadAsCsv(this.result).catch((e) => {
        console.error(e);
        this.isError = true;
        this.errorTitle = "Ошибка";
        this.errorMsg = "Ошибка при конвертации в csv!";
      });
    },

    exportAsJson() {
      Utils.downloadAsJson(this.items);
    },

    scan() {
      if (!this.searchStr) {
        this.isError = true;
        this.errorTitle = "Ошибка";
        this.errorMsg = "Пожалуйста, введите поисковый запрос";
        return;
      }

      this.$emit("scan-start");
      API.scan(this.searchStr)
        .then((res) => res.json())
        .then((result) => this.onScan(result))
        .catch((e) => {
          console.error(e);
          this.isError = true;
          this.errorTitle = "Ошибка";
          this.errorMsg = "Ошибка при скрейпинге!";
        })
        .finally(() => this.scanStop());
    },

    scanContent(content) {
      if (!this.scanSearchStr) {
        this.isError = true;
        this.errorTitle = "Ошибка";
        this.errorMsg = "Пожалуйста, введите поисковый запрос";
        return;
      }

      this.$emit("scan-start");
      API.scanContent(this.scanSearchStr, content, this.domain, {
        domain: this.domain,
        priceSelector: this.priceSelector,
        titleSelector: this.titleSelector,
      })
        .then((res) => res.json())
        .then((result) => this.onScan(result))
        .catch((e) => {
          console.error(e);
          this.isError = true;
          this.errorTitle = "Ошибка";
          this.errorMsg = "Ошибка при скрейпинге!";
        })
        .finally(() => this.scanStop());
    },

    onScan(result) {
      this.items = result.map((r) => ({
        ...r,
        prices: r.prices.join(", "),
      }));
      this.result = result;
    },

    scanUrls() {
      this.scanFromUrls = true;
    },

    scanFromFile() {
      this.scanFromFileDialog = true;
    },

    pickFileAndScan() {
      this.$refs.fileUpload.click();
    },

    closeErrorDialog() {
      this.isError = false;
      this.errorMsg = "";
      this.errorTitle = "";
    },

    closeScanFromUrlDialog() {
      this.scanFromUrls = false;
    },

    scanStart() {
      this.scanFromUrls = false;
      this.$emit("scan-start");
    },

    scanStop() {
      this.$emit("scan-stop", this.items);
    },

    querySearch(queryString, cb) {
      const domains = ConfigStorage.getRules().map(rule => ({value: rule.domain}));
      const results = domains.filter(domain => domain.value.includes(queryString));
      cb(results);
    },

    handleSelect(item) {
      this.domain = item.value;
    }
  },
};
</script>

<style>
.btns > * {
  margin-top: 10px !important;
}

.scan-btn {
  margin-top: 10px !important;
}

.autocomplete {
  width: 100%;
}
</style>