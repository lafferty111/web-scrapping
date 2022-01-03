<template>
  <el-dialog
    :before-close="() => this.$emit('close')"
    v-model="opened"
    title="Сканирование с ссылок"
  >
    <el-input placeholder="Название товара" v-model="searchStr"></el-input>
    <el-input
      type="textarea"
      :rows="2"
      placeholder="Введите ссылки, через запятую"
      v-model="refs"
    >
    </el-input>
    <el-button type="primary" @click="scanFromUrls()">Сканировать</el-button>

    <ErrorDialog
      :title="'Ошибка'"
      :msg="'Ошибка сканирования по ссылкам'"
      :show="isError"
      @close="isError = false"
    ></ErrorDialog>
  </el-dialog>
</template>

<script>
import { API } from "../utils/Api";
import ErrorDialog from "./ErrorDialog.vue";

export default {
  name: "ScanFromUrls",
  components: { ErrorDialog },
  props: {
    show: {
      type: Boolean,
      default: () => true,
    },
  },
  emits: ['on-scan'],
  watch: {
    show(value) {
      this.opened = value;
    },
  },

  data() {
    return {
      opened: this.show,
      searchStr: "",
      refs: "",

      isError: false,
    };
  },

  methods: {
    scanFromUrls() {
      this.$emit('scan-start');
      const urls = this.refs.replace(/\s\s+/gi, "").split(",");
      API.scanFromUrls(this.searchStr, urls)
        .then((res) => res.json())
        .then((res) => {
          this.$emit('on-scan', res);
        })
        .catch((e) => {
          console.error(e);
          this.isError = true;
        })
        .finally(() => {
          this.$emit('scan-stop');
        });
    },
  },
};
</script>
