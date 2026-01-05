import Category from "../model/cateModel.js";

export const category = async (req, res) => {
    const category = await Category.find()
    console.log("done")
    res.json(category)
}


export const addcategory = async (req, res) => {
    try {
        const { name, image } = req.body
        console.log(name, image)
        const newcategory = await Category.create({ name, image })
        res.status(201).json(newcategory)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Error creating category" })
    }
}

export const deletecategory = async (req, res) => {
    try {
        const { id } = req.params
        console.log("Deleting Category:", id)
        await Category.findByIdAndDelete(id)
        res.status(200).json({ message: "Category deleted" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to delete" })
    }
}

export const updatecategory = async (req, res) => {
    try {
        const { id } = req.params
        const { name, image } = req.body
        const updated = await Category.findByIdAndUpdate(id, { name, image }, { new: true })
        res.status(200).json(updated)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Update failed" })
    }
}
