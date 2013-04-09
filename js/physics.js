var Collision = {
    
    elastic: function(restitution){
        this.restitution = restitution || .2;
    },
    
    displace: function(){
    }
};

var PhysicsEntity = function(collisionName, type){
    this.type = type || PhysicsEntity.DYNAMIC;
    
    this.collision = collisionName || PhysicsEntity.ELASTIC;
    
    this.width = 20;
    this.height = 20;
    
    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;
    
    var collision = Collision[this.collision];
    collision.call(this);
    
    this.x = 0;
    this.y = 0;
    
    this.vx = 0;
    this.vy = 0;
    
    this.ax = 0;
    this.ay = 0;
    
    this.updateBounds();
};

PhysicsEntity.prototype = {
    updateBounds: function(){
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
    },
    
    getMidX: function(){
        return this.halfWidth + this.x;
    },
    getMidY: function(){
        return this.halfHeight + this.y;
    },
    
    getTop: function(){
        return this.y;
    },
    getLeft: function(){
        return this.x;
    },
    getRight: function(){
        return this.x + this.width;
    },
    getBottom: function(){
        return this.y + this.height;
    }
};

PhysicsEntity.KINEMATIC = "kinematic";
PhysicsEntity.DYNAMIC = "dynamic";

PhysicsEntity.DISPLACE = "displace";
PhysicsEntity.ELASTIC = "elastic";
