const SandBox = require('../models/sandboxModel')



const homeSandBox = (req, res) => {
    res.status(200).json({ 'hiiii': 'how are you' })
}

const sandboxCreate = async (req, res) => {
    const { first, second, third } = req.body
    try {
        const doing = await SandBox.create({ first, second, third })
        res.status(200).send(doing)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }

}

const GetAll = async (req, res) => {
    try {
        const all = await SandBox.find()
        res.status(200).send(all)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }

}


const singleData = async (req, res) => {
    const id = req.params.id
    try {
        const item = await SandBox.findById(id)
        res.status(200).send(item)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }

}


const deleteData = async (req, res) => {
    const id = req.params.id //params gives the colon id
    try {
        const item = await SandBox.findByIdAndDelete(id)
        res.status(200).send(item)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }

}


const updateData = async (req, res) => {
    const { first, second, third } = req.body
    try {
        const update = await SandBox.findById(req.params.id)

        update.first = first;
        update.second = second;
        update.third = third;
        await update.save()
        res.status(200).send("Article updated")
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

}


module.exports = {
    homeSandBox,
    sandboxCreate,
    GetAll,
    singleData,
    deleteData,
    updateData
}