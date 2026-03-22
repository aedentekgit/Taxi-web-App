const RentalPackage = require('../models/RentalPackage');

exports.getAllPackages = async (req, res) => {
  try {
     const page  = Math.max(1, parseInt(req.query.page)  || 1);
     const limit = Math.min(100, parseInt(req.query.limit) || 10);
     const skip  = (page - 1) * limit;

     const filter = {};
     if (req.query.search) {
       filter.package_name = { $regex: req.query.search, $options: 'i' };
     }
     
     const [packages, total] = await Promise.all([
       RentalPackage.find(filter).sort({ _id: 1 }).skip(skip).limit(limit),
       RentalPackage.countDocuments(filter),
     ]);

     const parsedResults = packages.map(pkg => ({
         ...pkg.toJSON(),
         id: pkg._id.toString()
     }));
     res.status(200).json({ success: true, data: parsedResults, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
     console.error('Error fetching rental packages:', err);
     res.status(500).json({ message: 'Server error fetching rental packages' });
  }
};

exports.createPackage = async (req, res) => {
  try {
    const pkg = await RentalPackage.create(req.body);
    const io = req.app.get('io');
    if (io) io.emit('rentalPackagesUpdate');
    res.status(201).json({ message: 'Rental package added successfully', data: pkg });
  } catch (err) {
    console.error('Error adding rental package:', err);
    res.status(500).json({ message: 'Server error adding rental package' });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const pkg = await RentalPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pkg) return res.status(404).json({ message: 'Rental package not found' });
    
    const io = req.app.get('io');
    if (io) io.emit('rentalPackagesUpdate');
    
    res.status(200).json({ message: 'Rental package updated successfully' });
  } catch (err) {
    console.error('Error updating rental package:', err);
    res.status(500).json({ message: 'Server error updating rental package' });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const pkg = await RentalPackage.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Rental package not found' });

    const io = req.app.get('io');
    if (io) io.emit('rentalPackagesUpdate');

    res.status(200).json({ message: 'Rental package deleted successfully' });
  } catch (err) {
    console.error('Error deleting rental package:', err);
    res.status(500).json({ message: 'Server error deleting rental package' });
  }
};

exports.updatePackageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const pkg = await RentalPackage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!pkg) return res.status(404).json({ message: 'Rental package not found' });

    const io = req.app.get('io');
    if (io) io.emit('rentalPackagesUpdate');

    res.status(200).json({ message: 'Rental package status updated successfully' });
  } catch (err) {
    console.error('Error updating rental package status:', err);
    res.status(500).json({ message: 'Server error updating rental package status' });
  }
};
