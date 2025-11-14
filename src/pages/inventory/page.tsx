import { CategoriesDataTable } from './components/category/categories-data-table'
import { ProductsDataTable } from './components/products/products-data-table'

import PageHeader from '@/components/common/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageLayout from '@/layouts/PageLayout'


export default function InventoryPage() {
  return (
    <div>
      <PageHeader
        title="Inventory Management"
        description="Manage product stock, categories, and brands."
      />
      <PageLayout>
        <div className="flex flex-col px-8 py-2.5">
          <Tabs defaultValue="products" className="mt-4">
            <TabsList className="grid w-full grid-cols-2 md:w-[240px]">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-4">
              <ProductsDataTable />
            </TabsContent>
            <TabsContent value="categories" className="mt-4">
              <CategoriesDataTable />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  )
}
