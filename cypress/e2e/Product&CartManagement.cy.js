const productName = "winter";

describe("Product and Cart Management", () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it("Verify All Products and Product Details page", () => {
        cy.visit("/");

        // Validate URL and page elements
        cy.url().should("include", "automationexercise");
        cy.title().should('eq', 'Automation Exercise');
        cy.xpath("//img[@alt='Website for automation practice']").should("exist").and("be.visible");

        //Click on products button and verify that All products page is opened 
        cy.get("a[href='/products']").click();
        cy.get("a[href='/products']").should("have.css", "color", "rgb(255, 165, 0)");
        cy.url().should("contain", "products");
        cy.title().should("contain", "Automation Exercise - All Products")

        //Product list is visible
        cy.get('.features_items .col-sm-4').should('have.length.greaterThan', 0);
        cy.get('.features_items .col-sm-4').each(($el) => {
            cy.wrap($el).should('be.visible');
        });

        //Click on first product on "View product" button
        cy.get("a[href='/product_details/1']").first().click();

        //Verify that user is redirected to Product Details page
        cy.url().should("contain", "product_details");
        cy.get("button[type='button']").should("contain", "Add to cart").and("be.visible");

        //Verify that detail detail is visible: product name, category, price, availability, condition, brand
        cy.get(".product-information h2").should('be.visible').and('contain.text', 'Blue Top');
        cy.get('.product-information p').eq(0).should('be.visible').and('contain.text', 'Category: Women > Tops');
        cy.get('.product-information span span').should('be.visible').and('contain.text', 'Rs. 500');
        cy.get('.product-information p').eq(1).should('be.visible').and('contain.text', 'Availability: In Stock');
        cy.get('.product-information p').eq(2).should('be.visible').and('contain.text', 'Condition: New');
        cy.get('.product-information p').eq(3).should('be.visible').and('contain.text', 'Brand: Polo');
    })


    it("Search products", () => {
        cy.visit("/");

        // Validate URL and page elements
        cy.url().should("include", "automationexercise");
        cy.title().should('eq', 'Automation Exercise');
        cy.xpath("//img[@alt='Website for automation practice']").should("exist").and("be.visible");

        //Click on products and verify that All products page is opened 
        cy.get("a[href='/products']").click();
        cy.get("a[href='/products']").should("have.css", "color", "rgb(255, 165, 0)");
        cy.url().should("contain", "products");
        cy.title().should("contain", "Automation Exercise - All Products");

        //Enter product name in search input and click search button
        cy.get("#search_product").type(productName);
        cy.get("#search_product").should("have.value", productName);
        cy.get("#submit_search").click();

        //Verify 'SEARCHED PRODUCTS' is visible
        cy.get(".title.text-center").should("exist").and("be.visible").and("contain", "Searched Products");

        //Verify all the products related to search are visible
        cy.get("body").then($body => {
            if ($body.find(".productinfo").length > 0) {
                // If product exist, the each loop starts
                cy.get(".productinfo").should("be.visible").each(($product) => {
                    cy.wrap($product).within(() => {
                        cy.get("p").invoke("text").then((text) => {
                            expect(text.toLowerCase()).to.include(productName);
                        });
                    });
                });
                cy.get(".productinfo").should('have.length.greaterThan', 0);
            } else {
                // If product doesn't exist, send message
                cy.log("No such product");
            }
        });

    })


    it("Add products to the cart", () => {

        // Variables to store product IDs
        let firstProductId;
        let secondProductId;
        let firstProductPrice;
        let secondProductPrice;
        const quantity = 1; // Quantity is 1 for both

        // This function returns the total price
        let calculateTotalPrice = (price, quantity) => {
            return price * quantity;
        }

        //Go to homepage
        cy.visit("/");

        //Verify that home page is visible successfully
        cy.url().should("include", "automationexercise");
        cy.title().should('eq', 'Automation Exercise');
        cy.xpath("//img[@alt='Website for automation practice']").should("exist").and("be.visible");

        //Click on "Products" button  
        cy.get("a[href='/products']").click();

        //Hover over first product and click 'Add to cart'
        cy.get(".product-overlay").first().trigger("mouseover", { force: true });
        cy.get('.product-overlay').first().within(() => {
            // Invokes `data-product-id` atribute from `a` element
            cy.get('a').invoke('attr', 'data-product-id').then((id) => {
                firstProductId = id;


                // Invokes number from `<h2>` element
                cy.get('h2').invoke('text').then((text) => {
                    firstProductPrice = +text.replace(/[^0-9]/g, '');
                    cy.log(`Product ID: ${firstProductId}, Price: ${firstProductPrice}`);
                    cy.log(typeof firstProductPrice);
                });
            });
        });
        cy.get('.product-overlay').first().contains('Add to cart').click({ force: true });

        //Click 'Continue Shopping' button
        cy.get(".btn-success").click();

        //Hover over second product and click 'Add to cart'
        cy.get(".product-overlay").eq(1).trigger("mouseover", { force: true });
        cy.get('.product-overlay').eq(1).within(() => {
            cy.get("a").invoke('attr', 'data-product-id').then((id) => {
                secondProductId = id;
                // Invokes number from `<h2>` element
                cy.get('h2').invoke('text').then((text) => {
                    secondProductPrice = text.replace(/[^0-9]/g, '');
                    cy.log(`Product ID: ${secondProductId}, Price: ${secondProductPrice}`);
                });
            });
        });

        cy.get('.product-overlay').eq(1).contains('Add to cart').click({ force: true });

        //Click 'View Cart' button
        cy.get(".modal-body a").click();

        //Verify both products are added to Cart
        cy.get('.cart_info').within(() => {
            cy.get(`a[data-product-id='${firstProductId}']`).should('exist');
            cy.get(`a[data-product-id='${secondProductId}']`).should('exist');
        });

        // Verify prices, quantity and total price for the first product
        cy.get('tbody tr').each(($tr) => {
            const rowId = $tr.attr('id');

            if (rowId && rowId.includes(firstProductId)) {
                cy.wrap($tr).within(() => {
                    cy.get('.cart_price').should('contain', `Rs. ${firstProductPrice}`);
                    cy.get('.cart_quantity').should('contain', quantity.toString());
                    cy.get('.cart_total_price').should('contain', `Rs. ${calculateTotalPrice(firstProductPrice, quantity)}`);

                });
            }
        });

        // Verify prices, quantity and total price for the second product
        cy.get('tbody tr').each(($tr) => {
            const rowId = $tr.attr('id');

            if (rowId && rowId.includes(secondProductId)) {
                cy.wrap($tr).within(() => {
                    cy.get('.cart_price').should('contain', `Rs. ${secondProductPrice}`);
                    cy.get('.cart_quantity').should('contain', quantity.toString());
                    cy.get('.cart_total_price').should('contain', `Rs. ${calculateTotalPrice(secondProductPrice, quantity)}`);
                });
            }
        });
    });

    it.only("Verify product quantity in the cart", () => {
        const productId = 1;
        const quantity = 4;
        //Go to homepage
        cy.visit("/");

        //Verify that home page is visible successfully
        cy.url().should("include", "automationexercise");
        cy.title().should('eq', 'Automation Exercise');
        cy.xpath("//img[@alt='Website for automation practice']").should("exist").and("be.visible");

        //Click 'View Product' for any product on home page
        cy.get(`a[href='/product_details/${productId}']`).click(); 

        //Verify product detail is opened
        cy.url().should('include', `/product_details/${productId}`);

        //Increase quantity to 4
        cy.get("#quantity").clear().type(quantity);

        //Click 'Add to cart' button
        cy.get(".cart").click();

        //Click 'View Cart' button
        cy.get("p[class='text-center'] a").click();

        //Verify that product is displayed in cart page with exact quantity
        cy.get(".cart_quantity button").should("contain", quantity);

    })
});






