<template>
  <section class="hero is-fullheight">
    <div class="hero-head">
      <NavBar />
    </div>
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
                v-for="(product, index) in products"
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

              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td v-if="!isNewLine"><button class="button is-success" v-on:click="addNewLine()">Add New</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <form v-if="isNewLine" @submit="submit">
          <div class="table container">
            <table class="table is-fullwidth">
              <tbody>
                <tr>
                  <td>
                    <div class="field">
                      <div class="control">
                        <input type="text" class="input" placeholder="code" v-model="code" :error="codeError">
                        <p class="help is-danger">{{ codeError }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="field">
                      <div class="control">
                        <input type="text" class="input" placeholder="name" v-model="name" :error="nameError">
                        <p class="help is-danger">{{ nameError }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="field">
                      <div class="control">
                        <input type="text" class="input" placeholder="price" v-model="basePrice" :error="basePriceError">
                        <p class="help is-danger">{{ basePriceError }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="field is-grouped">
                      <div class="control">
                        <button class="button is-link">Submit</button>
                      </div>
                      <div class="control">
                        <button class="button is-danger" @click='cancelAddNewLine()'>cancel</button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>

        <section class="section" v-if="!isNewLine">
          <button class="button is-link" v-on:click="next()">Next</button>
        </section>

      </div>
    </div>
    <div class="hero-foot">Created by Mindaugas Januška</div>
  </section>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useField, useForm, useResetForm } from 'vee-validate'
import { number, string } from 'yup'
import NavBar from '../components/NavBar.vue'

export default {
    components: { NavBar },
    setup() {
        let products = ref([])
        let isNewLine = ref(false)
        let taxValue = ref(0.21)
        const store = useStore()
        const router = useRouter()
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
        const validationss = {
          code: number().required().min(3),
          name: string().required().min(3),
          basePrice: number().required()
        }

        const { handleSubmit } = useForm({
          validationSchema: validationss
        })

        const submit = handleSubmit((values, { resetForm }) => {
          basePrice.value = parseFloat(basePrice.value.replace(',', '.').replace(' ', '')) // convert commas to dots to avoid NaN
          const totalPrice = countTax(basePrice.value)
          const product = { code: code.value, name: name.value, basePrice: basePrice.value, totalPrice: totalPrice }
          products.value.push(product)
          localStorage.setItem('products', JSON.stringify(products.value))
          isNewLine.value = false
          code.value = ''
          name.value = ''
          basePrice.value = ''
          resetForm() // https://vee-validate.logaretm.com/v4/guide/composition-api/handling-forms#handling-submissions
        })

        const { value: code, errorMessage: codeError } = useField('code')
        const { value: name, errorMessage: nameError } = useField('name')
        const { value: basePrice, errorMessage: basePriceError } = useField('basePrice')
        
        const resetForm = useResetForm()

        function cancelAddNewLine () {
          resetForm(); // resets the form
          isNewLine.value = false
        }

        function populateLocalStorageWithDummyData () {
          const products = [
            { code: '12345', name: 'T-shirt', basePrice: '14.78' },
            { code: '54321', name: 'Cardigan', basePrice: '34.56' }
            ]
            localStorage.setItem('products', JSON.stringify(products))
            localStorage.setItem('productEditIndex', null)
        }

        function createLocalStorage () {
          let products = localStorage.getItem('products')
          let tempLocalStorageArr = JSON.parse(localStorage.getItem('products'))
            if (!products && !tempLocalStorageArr) { // if localStorage is completely empty (or deleted), then it doesn't has any records, hence 'products' and 'tempLocalStorage' are equal to 'null'
                populateLocalStorageWithDummyData()
            } 
            else if (Object.keys(tempLocalStorageArr).length === 0) { // if all items was removed from localStorage, then it has empty object named 'products', but object's length is 0.
                populateLocalStorageWithDummyData()
            }
        }

        function setProducts () {
            products.value = JSON.parse(localStorage.getItem('products'))
        }

        function countTotalPrice () {
            products.value.forEach(element => {
                const totalPrice = countTax(element.basePrice)
                element.totalPrice = totalPrice
            })
        }

        function countSubtotal () {
            let basePriceTotal = 0
            let totalPriceSubtotal = 0
            products.value.forEach(element => {
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
            products.value = JSON.parse(localStorage.getItem('products'))
            localStorage.setItem('productEditIndex', null)
        }

        function save (product) {
            if (typeof product.basePrice === 'string' || product.basePrice instanceof String) {
                product.basePrice = parseFloat(product.basePrice.replace(',', '.').replace(' ', '')) // convert commas to dots to avoid NaN. Because you never know if user inputs comma or dot.
            }
            product.isEditMode = false
            localStorage.setItem('products', JSON.stringify(this.products))
            localStorage.setItem('productEditIndex', null)
            products.value = JSON.parse(localStorage.getItem('products'))
        }

        function remove (product, index) {
            products.value.splice(index, 1)
            // product.isEditMode = false
            localStorage.setItem('products', JSON.stringify(products.value))
            localStorage.setItem('productEditIndex', null)
        }

        function addNewLine () {
            isNewLine.value = true
        }

        function next () {
          localStorage.setItem('products', JSON.stringify(products.value))
          router.push('/billPage')
        }

        createLocalStorage()
        setProducts()
        countTotalPrice()
        countSubtotal()

        watch(products, () => {
            countTotalPrice()
            countSubtotal()
        },
        { deep: true }
        )

        return {
            products,
            isNewLine,
            name,
            nameError,
            basePrice,
            basePriceError,
            taxValue,
            subtotalBasePrice,
            subtotalTotalPrice,
            codeError,
            code,
            createLocalStorage,
            setProducts,
            countTotalPrice,
            countSubtotal,
            countTax,
            edit,
            cancel,
            save,
            remove,
            addNewLine,
            submit,
            cancelAddNewLine,
            next
        }
    },
}
</script>