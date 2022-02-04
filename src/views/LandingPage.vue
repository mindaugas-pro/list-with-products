<template>
  <section class="hero is-fullheight">
    <div class="hero-head">Navigation bar</div>
    <div class="hero-body">
      <div class="container">

        <div class="table container">
          <table class="table is-fullwidth">
          <thead>
            <tr>
              <th><abbr title="Code">Code</abbr></th>
              <th>Name</th>
              <th><abbr title="Base Price">Base Price</abbr></th>
              <th><abbr title="Total Price">Total Price</abbr></th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(product, index) in productsLocalStorage"
              :key="product.index"
              >
                <td>
                  <input v-if="product.isEditMode" type="text" class="input" v-model="product.code">
                  <span v-else>{{ product.code }}</span>
                </td>

                <td>
                  <input v-if="product.isEditMode" type="text" class="input" v-model="product.name">
                  <span v-else>{{ product.name }}</span>
                </td>
                <td>
                  <input v-if="product.isEditMode" type="text" class="input" v-model="product.basePrice">
                  <span v-else>{{ product.basePrice }}</span>
                </td>
                <td>{{ product.totalPrice }}</td>
                <td>
                  <button v-if="product.isEditMode" class="button mr-1 my-1" v-on:click="save(product, index)">save</button>
                  <button v-if="product.isEditMode" class="button mr-1 my-1" v-on:click="cancel(product, index)">cancel</button>
                  <button v-if="product.isEditMode" class="button mr-1 my-1" v-on:click="remove(product, index)">delete</button>
                  <button v-if="!product.isEditMode" class="button" v-on:click="edit(product, index)">edit</button>
                </td>
            </tr>

            <tr>
              <td>Subtotal:</td>
              <td></td>
              <td>{{ subtotalBasePrice }}</td>
              <td>{{ subtotalTotalPrice }}</td>
              <td></td>
            </tr>

            <tr v-if="isEmptyLine">
              <td>{{ }}</td>
              <td>{{ }}</td>
              <td>{{ }}</td>
              <td>{{ }}</td>
              <td><button class="button is-success" v-on:click="addNewLine()">add</button></td>
            </tr>
            <tr v-else>
              <td><input type="text" class="input" placeholder="code" v-model="code"></td>
              <td><input type="text" class="input" placeholder="name" v-model="name"></td>
              <td><input type="text" class="input" placeholder="base price" v-model="basePrice"></td>
              <td></td>
              <td><button class="button" v-on:click="addNew()">add</button></td>
              <td><button class="button" v-on:click="addNew()">cancel</button></td>
            </tr>
          </tbody>
        </table>
        </div>

        <button class="button is-link" v-on:click="next()">Continue</button>

      </div>
    </div>
    <div class="hero-foot">Created by Mindaugas Januška</div>
  </section>
</template>

<script>
export default {
  computed: {
    subtotalBasePrice: {
      get () {
        return this.$store.getters.getSubtotalBasePrice
      },
      set (value) {
        this.$store.commit('SET_SUBTOTAL_BASE_PRICE', value)
      }
    },
    subtotalTotalPrice: {
      get () {
        return this.$store.getters.getSubtotalTotalPrice
      },
      set (value) {
        this.$store.commit('SET_SUBTOTAL_TOTAL_PRICE', value)
      }
    }
  },
  data () {
    return {
      isEmptyLine: true,
      isNewLine: false,
      code: '',
      name: '',
      basePrice: '',
      taxValue: 0.21,
      productsLocalStorage: []
    }
  },
  created () {
    this.createLocalStorage()
    this.setProductsLocalStorage()
    this.countTotalPrice()
    this.countSubtotal()
  },
  watch: {
    productsLocalStorage: {
        handler () {
            this.countTotalPrice()
            this.countSubtotal()
        },
        deep: true // callback will no longer be triggered on array mutation. To trigger on mutation, the 'deep: true' option must be specified.
    }
  },
  methods: {
    addNew () {
      if (!this.code && !this.name && !this.basePrice) {
        this.isEmptyLine = true
      } else {
        this.basePrice = parseFloat(this.basePrice.replace(',', '.').replace(' ', '')) // convert commas to dots to avoid NaN
        const totalPrice = this.countTax(this.basePrice)
        const product = { code: this.code, name: this.name, basePrice: this.basePrice, totalPrice: totalPrice }
        this.productsLocalStorage.push(product)
        localStorage.setItem('products', JSON.stringify(this.productsLocalStorage))
        this.isEmptyLine = true
        this.code = ''
        this.name = ''
        this.basePrice = ''
      }
    },
    addNewLine () {
      this.isEmptyLine = false
    },
    edit (product, index) {
      localStorage.setItem('productEditIndex', index)
    //   this.$set(product, 'isEditMode', true) // will trigger state updates in the reactivity system; 'product.isEditMode = true' doesn't trigger state updates. THIS WAS VALID IN VUE_2
      product['isEditMode'] = true // vue_3 edition
    },
    countTotalPrice () {
      this.productsLocalStorage.forEach(element => {
        const totalPrice = this.countTax(element.basePrice)
        element.totalPrice = totalPrice
      })
    },
    countTax (param) {
      const price = Number(param) // convert string to number
      const tax = price * this.taxValue
      return Math.round(((price + tax) + Number.EPSILON) * 100) / 100 // round to 2 decimal places
    },
    countSubtotal () {
      let basePriceTotal = 0
      let totalPriceSubtotal = 0
      this.productsLocalStorage.forEach(element => {
        const elementBasePrice = Number(element.basePrice)
        const elementTotalPrice = Number(element.totalPrice)
        basePriceTotal += elementBasePrice
        totalPriceSubtotal += elementTotalPrice
      })
      this.subtotalBasePrice = Math.round((basePriceTotal + Number.EPSILON) * 100) / 100 // round to 2 decimal places
      this.subtotalTotalPrice = Math.round((totalPriceSubtotal + Number.EPSILON) * 100) / 100 // round to 2 decimal places
    },
    createLocalStorage () {
        console.log('func createLocalStorage triggered')
        console.log(typeof(localStorage.getItem('products')))
        console.log(localStorage.getItem('products'))
      if (localStorage.getItem('products') === null || this.productsLocalStorage.length === 0) {
          console.log('func createLocalStorage if triggered')
        const products = [
          { code: '12345', name: 'T-shirt', basePrice: '14.78', totalPrice: null },
          { code: '54321', name: 'Cardigan', basePrice: '34.56', totalPrice: null }
        ]
        localStorage.setItem('products', JSON.stringify(products))
        localStorage.setItem('productEditIndex', null)
      }
    },
    setProductsLocalStorage () {
      this.productsLocalStorage = JSON.parse(localStorage.getItem('products'))
    },
    save (product) {
      if (typeof product.basePrice === 'string' || product.basePrice instanceof String) {
        product.basePrice = parseFloat(product.basePrice.replace(',', '.').replace(' ', '')) // convert commas to dots to avoid NaN
      }
      product.isEditMode = false
      localStorage.setItem('products', JSON.stringify(this.productsLocalStorage))
      localStorage.setItem('productEditIndex', null)
      this.productsLocalStorage = JSON.parse(localStorage.getItem('products'))
    },
    cancel (product) {
      product.isEditMode = false
      this.productsLocalStorage = JSON.parse(localStorage.getItem('products'))
      localStorage.setItem('productEditIndex', null)
    },
    next () {
      localStorage.setItem('products', JSON.stringify(this.productsLocalStorage))
      this.$router.push('/billPage')
    },
    remove (product, index) {
      this.productsLocalStorage.splice(index, 1)
      product.isEditMode = false
      localStorage.setItem('products', JSON.stringify(this.productsLocalStorage))
      localStorage.setItem('productEditIndex', null)
    }
  }
}
</script>
