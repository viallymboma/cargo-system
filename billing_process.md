Billing Generation Redesign Plan                                                                                                                                             
                                                                                                                                                                                  
     Summary                                                                                                                                                                      
                                                                                                                                                                                  
     Replace manual invoice creation forms with automatic invoice generation from shipments. Two entry points: (1) a "Generate Bill" button on each shipment row, and (2) a       
     shipment picker dialog on the billing page.                                                                                                                                  
                                                                                                                                                                                  
     Files to Modify (in order)                                                                                                                                                   
                                                                                                                                                                                  
     1. cargo-system/src/lib/api/adapters.ts                                                                                                                                      
                                                                                                                                                                                  
     - Fix BackendCreateInvoiceDto - remove items[] and description, add subtotal, tax?, discount?, total, matching the real backend DTO                                          
                                                                                                                                                                                  
     2. cargo-system/src/lib/api/billing.ts                                                                                                                                       
                                                                                                                                                                                  
     - Fix createInvoice() signature - accept {shipmentId, clientId, subtotal, tax?, discount?, total, dueDate?} instead of the current items[]-based shape                       
     - Add generateInvoiceForShipment(shipment: Shipment) method that:                                                                                                            
       a. Calls POST /billing/calculate with the shipment's origin, destination, weight, volume, declaredValue to get subtotal/tax/total                                          
       b. Calls POST /billing/invoices with shipmentId, clientId, and the calculated amounts                                                                                      
       c. Returns the created Invoice                                                                                                                                             
                                                                                                                                                                                  
     3. cargo-system/src/app/(dashboard)/dashboard/shipments/page.tsx                                                                                                             
                                                                                                                                                                                  
     - Import billingApi                                                                                                                                                          
     - Add generatingBillId state to track per-row loading                                                                                                                        
     - Add handleGenerateBill(shipment) handler that calls billingApi.generateInvoiceForShipment(shipment) with loading + toast feedback                                          
     - Add a FileText icon button in each shipment row's actions column (shows Loader2 spinner while generating)                                                                  
                                                                                                                                                                                  
     4. cargo-system/src/app/(dashboard)/dashboard/billing/page.tsx                                                                                                               
                                                                                                                                                                                  
     - Remove old invoiceForm state and handleSaveInvoice function                                                                                                                
     - Add shipmentSearch and generatingForShipmentId state                                                                                                                       
     - Add filteredShipments filtering (by tracking number, sender name, receiver name)                                                                                           
     - Add handleGenerateInvoiceForShipment(shipment) handler                                                                                                                     
     - Replace the invoice Dialog content (lines 650-744): instead of the manual form, show:                                                                                      
       - Search bar to filter shipments                                                                                                                                           
       - Scrollable table of shipments with columns: tracking number, sender, receiver, route, weight                                                                             
       - "Generer la facture" button on each row (with per-row loader)                                                                                                            
       - On success: refresh invoice list + show toast                                                                                                                            
     - Keep the view/details mode when currentInvoice is set                                                                                                                      
                                                                                                                                                                                  
     Data Flow                                                                                                                                                                    
                                                                                                                                                                                  
     Shipment (frontend) -> billingApi.generateInvoiceForShipment()                                                                                                               
       -> POST /billing/calculate { origin, destination, weight, volume, declaredValue }                                                                                          
          <- { subtotal, tax, total }                                                                                                                                             
       -> POST /billing/invoices { shipmentId, clientId, subtotal, tax, total }                                                                                                   
          <- Invoice (with auto-generated invoiceNumber)                                                                                                                          
                                                                                                                                                                                  
     Field Mapping (Frontend Shipment -> Backend)                                                                                                                                 
                                                                                                                                                                                  
     - shipment.id -> shipmentId                                                                                                                                                  
     - shipment.createdById -> clientId                                                                                                                                           
     - shipment.sender.country -> origin (already backend enum: "CHINA", "DUBAI", etc.)                                                                                           
     - shipment.receiver.country -> destination (already backend enum: "CAMEROON", etc.)                                                                                          
     - shipment.totalWeight -> weight                                                                                                                                             
     - shipment.volumetricWeight -> volume                                                                                                                                        
     - shipment.declaredValue -> declaredValue                                                                                                                                    
                                                                                                                                                                                  
     Verification                                                                                                                                                                 
                                                                                                                                                                                  
     - Open shipments page, click "Generate Bill" on a shipment row -> should show loader, then success toast                                                                     
     - Navigate to billing page -> new invoice should appear in the table                                                                                                         
     - On billing page, click "Nouvelle facture" -> dialog with searchable shipment list should open                                                                              
     - Search by tracking number -> list should filter                                                                                                                            
     - Click "Generer la facture" on a row -> loader, then toast, then invoice list refreshes                                                                                     
     - Check TypeScript: npx tsc --noEmit should pass with no errors