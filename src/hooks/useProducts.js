import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [JSON.stringify(filters)])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (filters.category && filters.category !== 'todos') {
        if (filters.category === 'novidades') {
          query = query.eq('is_new', true)
        } else if (filters.category === 'ofertas') {
          query = query.gt('discount', 0)
        } else {
          query = query.eq('category', filters.category)
        }
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { products, loading, error, refetch: fetchProducts }
}