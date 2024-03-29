import {cartService, productService,userService} from "../services/factory.js";
// import { Server } from "socket.io";

// const socket = new Server();

export const getProducts =  async (req, res) => {
    try {
      // const { limit } = req.query;
      // let productsList = await manager.productList(); // Obtener la lista de productos primero
  
      // if (limit) {
      //   let newProducts = productsList.slice(0, limit); // Recortar la lista si se proporciona el límite
      //   productsList = newProducts; // Asignar la nueva lista recortada
      // }
      const { limit, page, sort, query, availability } = req.query;
  
      const options = {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
      };
          
      const optionsQuery = {};
          
      if (query) {
        optionsQuery.title = { $regex: new RegExp(query, "i") };
      }
          
      const availabilityMap = {
        available: true,
        unavailable: false,
      };
          
      if (availability in availabilityMap) {
        optionsQuery.status = availabilityMap[availability];
      }
          
      const sortMap = {
        asc: 1,
        desc: -1,
      };
          
      if (sort in sortMap) {
        options.sort = { price: sortMap[sort] };
      }
          
      const result = await productService.getAll(optionsQuery, options);
          
      res.send({ status: "success", payload: result });
    } catch (error) {
      res.status(500).json({ error: `Ocurrió un error en el servidor: ${error}` });
    }
}

export const getProductss = async (req, res) => {
    try {
      const result = await productService.getAllL();  
      res.send({ status: "success", payload: result });
    }
    catch{
      res.status(500).json({ error: `Ocurrió un error en el servidor: ${error}` });
    }
}

export const createProduct = async (req, res) => {
    try {
      let productToAdd = req.body;
      // console.log(`Proximo producto a ser agregado ${productToAdd.title} ${productToAdd.description}`);
      if (!('status' in productToAdd)) {
        productToAdd.status = true;
      }
            let product = await productService.save(productToAdd);
      // socket.emit('change');
      if (product){
        res.send({status: "success", payload: product });
      }else{
        res.send({status: "failure invalid code"})
      }
    } catch (error) {
      res.status(500).json({ error: `Ocurrió un error en el servidor: ${error}` });
    }
}

export const getProductByID = async (req, res) => {
    const {pid} = req.params;
    // console.log(`pid: ${pid}`);
    const product = await productService.getProductsByID(pid);
    if(product) {
      res.send({status: "success", payload: product });
    }else {
      res.status(404).json({'error': 'Producto no encontrado'});
    }
}

export const updateProduct = async (req, res) => {
    const {pid} = req.params;
    // console.log(`pid: ${pid}`);
    const product = await productService.getProductsbyID(pid);
    if(product) {
    // socket.emit('change');
      res.send({status: "success", payload: product });
    }else {
      res.status(404).json({'error': 'Producto no encontrado'});
    }
}

export const deleteProductByID =async (req, res) => {
    const {pid} = req.params;
    let p = await productService.delete(pid);
    if (p){
      const users = await userService.getAll();
      console.log(users); 
      for (const element of users) {
        const user = await userService.getPremiumUsers(element);
        if (user === true) {
          const userCart= await cartService.getCartbyID(element.cart);
          console.log(`USER CART ${userCart}`);
          userCart.products.forEach(product => {
            if(product.productId === pid){
              const emailBody = {
                to: element.email,
                subject: "Producto eliminado",                
                html: "<h1>Hola " + element.first_name + "</h1><br/><h2>Se ha eliminado un producto que estaba en tu carrito, nos vemos proximamente</h2>"
              }
            try {
              fetch("http://localhost:" + process.env.PORT + "/mail/send", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify(emailBody)
              });
            } catch (error) {
              console.log(error);
            }
          }
            
        });
        }
      }
    } 
    
    // socket.emit('change');
  if(p) {
    res.send({status: "success", payload: p });
  }else {
      res.status(404).json({'error': 'Producto no encontrado'});
    }
}


