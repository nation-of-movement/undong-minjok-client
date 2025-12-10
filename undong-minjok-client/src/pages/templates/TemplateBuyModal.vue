<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-box">

      <h2 class="modal-title">템플릿 구매</h2>
      <p class="modal-sub">
        이 템플릿을 구매하시겠습니까?
      </p>

      <div class="template-info">
        <span class="template-name">{{ templateTitle }}</span>
        <span class="template-price">
          {{ price === 0 ? "무료" : `₩${price}` }}
        </span>
      </div>

      <div class="button-row">
        <button class="cancel-btn" @click="close">취소</button>
        <button class="buy-btn" @click="confirmBuy">구매하기</button>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "TemplateBuyModal",
  props: {
    templateTitle: String,
    price: Number
  },
  emits: ["close", "confirm"],
  methods: {
    close() {
      this.$emit("close");
    },
    confirmBuy() {
      this.$emit("confirm");
    }
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-box {
  width: 380px;
  background: #111;
  padding: 24px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 8px 25px rgba(0,0,0,0.5);
  color: white;
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.modal-sub {
  opacity: 0.8;
  margin-bottom: 20px;
}

.template-info {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 24px;
}

.template-name {
  font-size: 16px;
}

.template-price {
  font-weight: 700;
}

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 10px 16px;
  border-radius: 8px;
  background: #333;
  color: white;
  border: none;
}

.buy-btn {
  padding: 10px 18px;
  border-radius: 8px;
  background: #e60023;
  color: white;
  font-weight: bold;
  border: none;
}
</style>
