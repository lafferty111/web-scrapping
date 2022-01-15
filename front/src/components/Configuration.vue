<template>
  <div>
    <el-dialog v-model="intDialogVisible" title="Конфигурация">
      <div class="settings">
        <el-checkbox
          v-model="advanced"
          label="Продвинутый поиск (медленнее, но поддержка большего количества сайтов)"
        ></el-checkbox>
        <el-checkbox
          v-model="scanAd"
          label="Сканировать рекламу выдачи поисковых результатов Google"
        ></el-checkbox>
        <el-checkbox
          v-model="scanFirst"
          label="Сканирование только первого товара на сайте"
        ></el-checkbox>
        <el-checkbox
          v-model="scanWithoutPrice"
          label="Показывать товары без цены"
        ></el-checkbox>
        <el-checkbox
          v-model="scanWithoutTitle"
          label="Показывать товары без названия"
        ></el-checkbox>
        <el-input-number v-model="pageCount" label="Количество страниц для сканирования" :min="1" :max="10"></el-input-number>
        <el-button
          class="rule-registry"
          type="primary"
          @click="ruleRegistryVisible = true"
        >
          Реестр правил
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      v-model="ruleRegistryVisible"
      title="Конфигурация реестра правил"
    >
      <el-input class="rule-input" v-model="ruleDomain" placeholder="Домен" />
      <el-input
        class="rule-input"
        v-model="rulePrice"
        placeholder="Селектор для цены"
      />
      <el-input
        class="rule-input"
        v-model="ruleTitle"
        placeholder="Селектор для заголовка"
      />
      <el-button class="add-rule" type="primary" @click="addRule()">
        Добавить правило
      </el-button>

      <div class="registry-list">
        <div v-for="rule in rules" class="rule" :key="rule.domain">
          <div class="rule_delete" @click="deleteRule(rule)">Удалить</div>
          <div><strong>Домен:</strong> {{ rule.domain }}</div>
          <div>
            <strong>Селектор для цены:</strong> {{ rule.priceSelector }}
          </div>
          <div>
            <strong>Селектор для заголовка:</strong> {{ rule.titleSelector }}
          </div>
          <hr />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ConfigStorage } from "../utils/ConfigStorage";
export default {
  name: "Configuration",
  components: {},
  props: {
    dialogVisible: {
      type: Boolean,
      default: () => false,
    },
  },
  watch: {
    intDialogVisible(value) {
      this.$emit("change-dialog-visible", value);
    },
    dialogVisible(value) {
      this.intDialogVisible = value;
    },
    scanAd: function (newVal) {
      ConfigStorage.setScanAd(newVal);
    },
    scanFirst: function (newVal) {
      ConfigStorage.setScanFirst(newVal);
    },
    scanWithoutPrice: function (newVal) {
      ConfigStorage.setScanWithoutPrice(newVal);
    },
    scanWithoutTitle(newVal) {
      ConfigStorage.setScanWithoutTitle(newVal);
    },
    pageCount(newVal) {
      ConfigStorage.setPageCount(newVal);
    },
    advanced(newVal) {
      ConfigStorage.setAdvanced(newVal);
    }
  },
  data() {
    return {
      intDialogVisible: this.dialogVisible,
      scanAd: ConfigStorage.getScanAd(),
      scanFirst: ConfigStorage.getScanFirst(),
      scanWithoutPrice: ConfigStorage.getScanWithoutPrice(),
      scanWithoutTitle: ConfigStorage.getScanWithoutTitle(),
      rules: ConfigStorage.getRules(),
      pageCount: ConfigStorage.getPageCount(),
      advanced: ConfigStorage.getAdvanced(),

      ruleDomain: "",
      rulePrice: "",
      ruleTitle: "",
      ruleRegistryVisible: false,
    };
  },
  methods: {
    addRule() {
      if (this.ruleDomain && (this.rulePrice || this.ruleTitle));
      this.rules.push({
        domain: this.ruleDomain,
        priceSelector: this.rulePrice,
        titleSelector: this.ruleTitle,
      });
      ConfigStorage.addRule(this.ruleDomain, this.rulePrice, this.ruleTitle);
      this.$emit("change-rule", this.rules);
    },
    deleteRule(rule) {
      this.rules = this.rules.filter(_rule => _rule.domain !== rule.domain);
      ConfigStorage.deleteRule(rule);
    }
  },
};
</script>

<style>
.settings {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.el-dialog {
  min-width: 600px;
}

.el-checkbox {
  display: block;
}

.rule-input {
  margin-top: 10px !important;
}

.registry-list {
  display: flex;
  flex-direction: column;
  text-align: start;
}

.rule-registry {
  align-self: center;
  margin-top: 20px !important;
}

.add-rule {
  margin-top: 20px !important;
}

.rule {
  position: relative;
}

.rule_delete {
  position: absolute;
  right: 0;
  cursor: pointer;
  color: gray;
  font-size: 11px;
}
</style>