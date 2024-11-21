import mongoose, { Schema, Document } from 'mongoose';

interface IWorkspace extends Document {
  name: string;
  description: string;
  members: string[]; 
  admins: string[]; 
  mapId: string;   
  thumbnail:string;
}


const WorkspaceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    members: {
      type: [String], 
      required: true,
    },
    admins: {
      type: [String], 
      required: true,
    },
    mapId: {
      type: String, 
      required: true,
    },
    thumbnail:{
        type:String,
        require:true
    }
  },
  {
    timestamps: true, 
  }
);


const Workspace = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);

export default Workspace;
