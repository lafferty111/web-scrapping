<template>
  <div class="item-cards">
    <div class="item-card" v-for="card in items" :key="card.id">
      <h3>{{ card.title }}</h3>
      <h5>{{ card.prices }} руб.</h5>
      <el-button type="primary" @click="goto(card.href)">
        {{ card.domain || "Перейти" }}
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "CardList",
  components: {},
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {};
  },
  methods: {
    goto(ref) {
      window.open(ref, "_blank");
    },
  },
};
</script>

<style>
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
</style>
