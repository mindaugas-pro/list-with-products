<template>
  <section class="hero is-fullheight">
    <div class="hero-head">Navigation bar</div>
    <div class="hero-body">
      <div class="table container">
          <table class="table is-fullwidth">
          <thead>
            <tr>
              <th><abbr title="Code">Code</abbr></th>
              <th>Name</th>
              <th><abbr title="Base Price">Base Price</abbr></th>
              <th><abbr title="Total Price">Total Price</abbr></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(product) in productsLocalStorage"
              :key="product.index"
              >
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td>{{ product.basePrice }}</td>
                <td>{{ product.totalPrice }}</td>
            </tr>

            <tr>
              <td>Subtotal:</td>
              <td></td>
              <td>{{ subtotalBasePrice }}</td>
              <td>{{ subtotalTotalPrice }}</td>
              <td></td>
            </tr>

          </tbody>
        </table>
        <button class="button is-success" v-on:click="back()">Back</button>
      </div>

    </div>
    <div class="hero-foot">Created by Mindaugas Januška</div>
  </section>
</template>

<script>
export default {
  computed: {
    subtotalBasePrice () {
      return this.$store.getters.getSubtotalBasePrice
    },
    subtotalTotalPrice () {
      return this.$store.getters.getSubtotalTotalPrice
    }
  },
  data () {
    return {
      productsLocalStorage: null,
      taxValue: 0.21
    }
  },
  created () {
    this.productsLocalStorage = JSON.parse(localStorage.getItem('products'))
  },
  methods: {
    back () {
      this.$router.push('/')
    }
  }
}
</script>
