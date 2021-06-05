//取 DOM → 給 BS Modal 使用
let productModal = '';
let delProductModal = '';

const app = Vue.createApp({
    data() {
        return {
            apiUrl: 'https://vue3-course-api.hexschool.io/',
            path: 'carrie',
            productsData: [],
            isNew: false,  //用來判斷是編輯或新增狀態 (因是同個 modal)
            tempProduct: {  //用來存 productsData 的單筆資料
                imagesUrl: [],
            }
        }
    },
    methods: {
        getProductData() {   //取得產品資料
            const url = `${this.apiUrl}api/${this.path}/admin/products`;
            axios.get(url)
                .then((res) => {
                    console.log(res);
                    if (res.data.success) {
                        this.productsData = res.data.products;
                    } else {
                        console.log(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        //POST/PUT 後台新增/編輯產品資訊
        //觸發在 Modal 內的按鈕

        updateProducts() {   //產品資料 ( 新增 & 修改 )
            //新增狀態

            let url = `${this.apiUrl}api/${this.path}/admin/product`;
            let httpMethod = 'post';
            //根據isNew 判斷要串接 post 或是 put API
            //!為反轉意思。判斷不是isNew原本狀態就帶入編輯狀態
            if (!this.isNew) {
                //編輯狀態
                url = `${this.apiUrl}api/${this.path}/admin/product/${this.tempProduct.id}`;
                httpMethod = 'put';
            }

            //POST 和 PUT 架構一樣(除了post put api 第二個參數不同)所以可以寫一起再另外處裡
            // axios.post(api, {})
            // .then(() => {})
            // .catch(() => {})

            // axios.put(api, {})
            // .then(() => {})
            // .catch(() => {})

            //因為httpMethod是變數的關係，所以使用中括號[]取代點.，物件取值的概念 (axios.httpMethod)
            axios[httpMethod](url, { data: this.tempProduct })
                .then((res) => {
                    if (res.data.success) {
                        alert(res.data.message)
                        productModal.hide();  //新增或編輯某狀態成功後，關掉 Modal
                        this.getProductData();  //重新渲染畫面
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        delProduct() {   //刪除產品
            const url = `${this.apiUrl}api/${this.path}/admin/product/${this.tempProduct.id}`;
            axios.delete(url)
                .then((res) => {
                    if (res.data.success) {
                        alert(res.data.message)
                        delProductModal.hide();
                        this.getProductData();  //重新渲染畫面
                    } else {
                        console.log(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        createImages() {
            this.tempProduct.imagesUrl = [];
            this.tempProduct.imagesUrl.push('');
        },
        openModal(isNew, item) {   //BS Modal 設定
            //新增與編輯是同一個 Modal 所以使用 isNew 做判斷目前在哪個狀態。
            if (isNew === 'new') { //新增
                this.tempProduct = {  //此為暫存資料，清空用
                    imagesUrl: [],  //因是第二層所以也需要定義，不然 vue 可能會出錯。
                };
                this.isNew = true;
                //套用BS modal.show() 方法
                productModal.show();
            } else if (isNew === 'edit') { //編輯
                //這邊用淺拷貝，不然修改同時原始資料也會一起修改(物件傳參考原理) 
                // this.tempProduct = { ...item };
                
                //更換深層拷貝 ▼
                //若已在某產品上傳了一些多圖，編輯該產品時 tempProduct 就會有兩層物件，可以改為深層拷貝將第二層的物件也一併複製，避免動到原本的資料（淺層拷貝在編輯產品 Modal 新增一張多圖，接著按「取消」關閉 Modal，下次再打開同個產品 Modal 時會發現那張圖還在）
                this.tempProduct = JSON.parse(JSON.stringify(item));
                this.isNew = false;
                productModal.show();
            } else if (isNew === 'delete') {  //刪除
                this.tempProduct = { ...item }; //modal需拿到title和刪除按鈕時需獲得 id。
                delProductModal.show();
            }
        }

    },
    mounted() {  //created 換成 mounted → 畫面生成完後，再來擷取動元素 DOM
        //------ BS modal 實體化 → BS Modal 中的 Via JavaScript
        //新增的 modal
        productModal = new bootstrap.Modal(document.querySelector('#productModal'), { keyboard: false });
        //刪除的 modal
        delProductModal = new bootstrap.Modal(document.querySelector('#delProductModal'), { keyboard: false });


        //------ 取出 Token
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)carrieHexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');

        //------ 排錯
        if (token === '') {
            alert('您尚未登入請重新登入。');
            window.location = 'login.html';
        }
        //------ 所有 axios 請求都會加上 token
        axios.defaults.headers.common['Authorization'] = token;

        this.getProductData();
    }
}).mount('#app');