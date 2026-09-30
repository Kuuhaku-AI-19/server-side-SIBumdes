module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            unique: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false  
        },
        number: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM(
                "super_admin",
                "admin_kantor_pusat",
                "admin_unit"
            ),
            allowNull: false,
            defaultValue: "admin_unit"
        },
        unit_usaha: {
           type: DataTypes.ENUM(
            "internet",
            "resik",
            "niaga",
            "mina"
           ),
           allowNull: false
        },
       created_at: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        updated_at: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
        },
            
        
    }, {
        sequelize,
        modelName: 'user',
        tableName: 'users',
        timestamps: false,
        underscored: true
    });
    
    User.associate = (models) => {
        User.hasMany(models.kantor_pusat, {
            foreignKey: 'user_id',
            as: 'kantor_pusat'
        });
        
        User.hasMany(models.internet, {
            foreignKey: 'user_id',
            as: 'internet'
        });
        
        User.hasMany(models.resik, {
            foreignKey: 'user_id',
            as: 'resik'
        });
        
        User.hasMany(models.niaga, {
            foreignKey: 'user_id',
            as: 'niaga'
        });
        
        User.hasMany(models.mina, {
            foreignKey: 'user_id',
            as: 'mina'
        });
        
        User.hasMany(models.customer_internet, {
            foreignKey: 'user_id',
            as: 'customer_internet'
        });
        
        User.hasMany(models.customer_resik, {
            foreignKey: 'user_id',
            as: 'customer_resik'
        });
    }
    
    return User
}

