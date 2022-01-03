<template>
  <el-dialog
    :before-close="() => this.$emit('close')"
    v-model="opened"
    :title="title"
  >
    {{ msg }}
  </el-dialog>
</template>

<script>
export default {
  name: "ErrorDialog",
  props: {
    title: {
      type: String,
      default: () => "",
    },
    msg: {
      type: String,
      default: () => "",
    },
    show: {
      type: Boolean,
      default: () => false,
    },
  },
  watch: {
    show(value) {
      this.opened = value;
    },
  },
  data() {
    return {
      opened: this.show,
    };
  },
};
</script>
