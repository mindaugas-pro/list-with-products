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
              :key="index"
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
                  <button v-if="product.isEditMode" class="button mr-1 my-1 is-small" v-on:click="save(product, index)">save</button>
                  <button v-if="product.isEditMode" class="button mr-1 my-1 is-small" v-on:click="cancel(product, index)">cancel</button>
                  <button v-if="product.isEditMode" class="button mr-1 my-1 is-small" v-on:click="remove(product, index)">delete</button>
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
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

export default {
    setup() {
        let productsLocalStorage = ref([])
        let isEmptyLine = ref(true)
        let isNewLine = ref(false)
        let code = ref('')
        let name = ref('')
        let basePrice = ref('')
        let taxValue = ref(0.21)
        const store = useStore()

        const subtotalBasePrice = computed({
            get: () => {
                return store.getters.getSubtotalBasePrice
            },
            set: (value) => {
                store.commit('SET_SUBTOTAL_BASE_PRICE', value)
            }
        })

        const subtotalTotalPrice = computed({
            get: () => {
                return store.getters.getSubtotalTotalPrice
            },
            set: (value) => {
                store.commit('SET_SUBTOTAL_TOTAL_PRICE', value)
            }
        })

        function createLocalStorage () {
            if (localStorage.getItem('products') === null || productsLocalStorage.value.length === 0) {
                console.log('func createLocalStorage if triggered')
                const products = [
                { code: '12345', name: 'T-shirt', basePrice: '14.78', totalPrice: null },
                { code: '54321', name: 'Cardigan', basePrice: '34.56', totalPrice: null }
                ]
                localStorage.setItem('products', JSON.stringify(products))
                localStorage.setItem('productEditIndex', null)
            }
        }

        function setProductsLocalStorage () {
            productsLocalStorage.value = JSON.parse(localStorage.getItem('products'))
        }

        function countTotalPrice () {
            productsLocalStorage.value.forEach(element => {
                const totalPrice = countTax(element.basePrice)
                element.totalPrice = totalPrice
            })
        }

        function countSubtotal () {
            let basePriceTotal = 0
            let totalPriceSubtotal = 0
            productsLocalStorage.value.forEach(element => {
                const elementBasePrice = Number(element.basePrice)
                const elementTotalPrice = Number(element.totalPrice)
                basePriceTotal += elementBasePrice
                totalPriceSubtotal += elementTotalPrice
            })
            subtotalBasePrice.value = Math.round((basePriceTotal + Number.EPSILON) * 100) / 100 // round to 2 decimal places
            subtotalTotalPrice.value = Math.round((totalPriceSubtotal + Number.EPSILON) * 100) / 100 // round to 2 decimal places
        }

        function countTax (param) {
            const price = Number(param) // convert string to number
            const tax = price * taxValue.value
            return Math.round(((price + tax) + Number.EPSILON) * 100) / 100 // round to 2 decimal places
        }

        function edit (product, index) {
            localStorage.setItem('productEditIndex', index)
            //   this.$set(product, 'isEditMode', true) // will trigger state updates in the reactivity system; 'product.isEditMode = true' doesn't trigger state updates. THIS WAS VALID IN VUE_2
            product['isEditMode'] = true // vue_3 edition
        }

        function cancel (product) {
            product.isEditMode = false
            productsLocalStorage.value = JSON.parse(localStorage.getItem('products'))
            localStorage.setItem('productEditIndex', null)
        }

        function save (product) {
            if (typeof product.basePrice === 'string' || product.basePrice instanceof String) {
                product.basePrice = parseFloat(product.basePrice.replace(',', '.').replace(' ', '')) // convert commas to dots to avoid NaN. Because you never know if user inputs comma or dot.
            }
            product.isEditMode = false
            localStorage.setItem('products', JSON.stringify(this.productsLocalStorage))
            localStorage.setItem('productEditIndex', null)
            productsLocalStorage.value = JSON.parse(localStorage.getItem('products'))
        }

        function remove (product, index) {
            productsLocalStorage.value.splice(index, 1)
            // product.isEditMode = false
            localStorage.setItem('products', JSON.stringify(productsLocalStorage.value))
            localStorage.setItem('productEditIndex', null)
        }

        function addNewLine () {
            isEmptyLine.value = false
        }

        function addNew () {
            if (!code.value && !name.value && !basePrice.value) {
                isEmptyLine.value = true
            } else {
                basePrice.value = parseFloat(basePrice.value.replace(',', '.').replace(' ', '')) // convert commas to dots to avoid NaN
                const totalPrice = countTax(basePrice.value)
                const product = { code: code.value, name: name.value, basePrice: basePrice.value, totalPrice: totalPrice }
                productsLocalStorage.value.push(product)
                localStorage.setItem('products', JSON.stringify(productsLocalStorage.value))
                isEmptyLine.value = true
                code.value = ''
                name.value = ''
                basePrice.value = ''
            }
        }

        createLocalStorage()
        setProductsLocalStorage()
        countTotalPrice()
        countSubtotal()

        watch(productsLocalStorage, () => {
            countTotalPrice()
            countSubtotal()
        },
        { deep: true }
        )

        return {
            productsLocalStorage,
            isEmptyLine,
            isNewLine,
            code,
            name,
            basePrice,
            taxValue,
            subtotalBasePrice,
            subtotalTotalPrice,
            createLocalStorage,
            setProductsLocalStorage,
            countTotalPrice,
            countSubtotal,
            countTax,
            edit,
            cancel,
            save,
            remove,
            addNewLine,
            addNew
        }
    },
}
</script>